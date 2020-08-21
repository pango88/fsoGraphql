const { ApolloServer, gql } = require('apollo-server');
const Author = require('./models/author');
const Book = require('./models/book');
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const MONGODB_URI =
  'mongodb+srv://pango:pango@emaily-l3wzb.azure.mongodb.net/BooksNAuthors?retryWrites=true&w=majority';
console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDb', error.message);
  });

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: String
    bookCount: Int!
    id: ID!
  }

  type Query {
    authorCount: Int!
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    bookCount: () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate('author');
      } else if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author });
        return Book.find({
          author: { $in: author._id },
          genres: { $in: args.genre },
        }).populate('author');
      } else if (args.author) {
        const author = await Author.findOne({ name: args.author });
        return Book.find({ author: { $in: author._id } }).populate('author');
      }
      return Book.find({ genres: { $in: args.genre } }).populate('author');
    },
    allAuthors: () => Author.find({}),
  },
  Author: {
    bookCount: async (root) => {
      const author = await Author.findOne({ name: root.name });
      return Book.find({ author: author._id }).countDocuments();
    },
  },
  Mutation: {
    addBook: async (root, { title, author, genres, published }) => {
      let authorid = await Author.findOne({ name: author });
      const existingAuthor = await Author.findOne({ name: author });
      if (!existingAuthor) {
        const newAuthor = new Author({ name: author });
        authorid = await newAuthor.save();
      }

      const book = new Book({
        title: title,
        author: authorid._id,
        genres: [...genres],
        published: published,
      });

      await book.save();
      return book;
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }
      author.born = args.setBornTo;
      await author.save();
      return author;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

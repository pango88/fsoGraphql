const { ApolloServer, gql } = require('apollo-server');
const Author = require('./models/author');
const Book = require('./models/book');

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
    author: String!
    published: Int!
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
    allBooks: (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({});
      } else if (args.author && args.genre) {
        /* */
        return books
          .filter((book) => book.author === args.author)
          .filter((book) => book.genres.includes(args.genre));
      } else if (args.author) {
        return books.filter((book) => book.author === args.author);
      }
      return books.filter((book) => book.genres.includes(args.genre));
      /* */
    },
    allAuthors: () => Author.find({}),
  },
  Author: {
    bookCount: (root) => {
      /* */
      const bookCount = books.reduce(
        (acc, cur) => (acc += cur.author === root.name ? 1 : 0),
        0
      );
      return bookCount;
      /* */
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const book = new Book({ ...args });

      const existingAuthor = Author.findOne({ name: args.name });
      if (!existingAuthor) {
        const author = { name: args.author, books: [args.title] };
        await author.save();
      }
      await book.save();
      return book;
    },
    editAuthor: (root, args) => {
      /* */
      const author = authors.find((a) => a.name === args.name);
      if (!author) {
        return null;
      }

      const updatedAuthor = { ...author, born: args.setBornTo };
      authors = authors.map((a) => (a.name === args.name ? updatedAuthor : a));
      return updatedAuthor;
      /* */
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

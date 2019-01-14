const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind }  = require('graphql/language');

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
    {
        title: 'Harry Potter and the Chamber of Secrets',
        author: {
            type: 'human',
            firstname: 'J.K',
            lastname: 'Rolins',
            gender: 'F',
            age: 53,
            birthday: new Date(),
            alive: function() { return this.age < 100; },
            date: '',
            fullname: function () {
                return this.firstname + ' ' + this.lastname;
            }
        },
    },
    {
        title: 'Jurassic Park',
        author: {
            type: 'human',
            firstname: 'Michael',
            lastname: 'Crichton',
            age: 26,
            alive: function() { return this.age < 100; },
            gender: 'H',
            birthday: new Date(),
            fullname: function () {
                return this.firstname + ' ' + this.lastname;
            }
        },
    },
    {
        title: '0101010101',
        author: {
            type: 'robot',
            firstname: 'Bender',
            lastname: 'Futurama',
            age: 26,
            power: true,
            gender: 'H',
            birthday: new Date(),
            fullname: function () {
                return this.firstname + ' ' + this.lastname;
            }
        },
    },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  union SearchResult = Human | Robot

  scalar Date

  type Human implements Author {
    firstname: String
    lastname: String
    fullname: String
    gender: String
    age: Int
    birthday: Date
    alive: Boolean
    type: String
  }
  
  type Robot implements Author {
    firstname: String
    lastname: String
    fullname: String
    gender: String
    age: Int
    birthday: Date
    power: Boolean
    type: String
  }

  # This "Book" type can be used in other type declarations.
  interface Author {
    firstname: String
    lastname: String
    fullname: String
    gender: String
    age: Int
    birthday: Date
    type: String
  }
  
  type Book {
    # test
    title: String
    author: Author
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books(gender: String): [Book]
    search: [SearchResult]
    date(date: Date): Date
  }
  
  type Mutation {
      addBook(title: String, author: String): Book
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
    Author: {
        __resolveType(author, context, info) {
            return author.type == 'robot' ? 'Robot' : 'Human';
        }
    },
    SearchResult: {
        __resolveType(author, context, info) {
            return author.type == 'robot' ? 'Robot' : 'Human';
        }
    },
    Query: {
        books(obj, args, context, info) {
            if (typeof args.gender !== "undefined") {
                return books.filter(book => book.author.gender === args.gender);
            }
            return books;
        },
        search(obj, args, context, info) {
            return books.map(book => book.author);
        },
        date(obj, args, context, info) {
            console.log(args.date);
            return args.date;
        },
    },
    Mutation: {
        addBook(obj, args, content, info) {
            let book = {
                title: args.title,
                author: {
                    firstname: 'aa',
                    lastname: 'aa',
                    fullname: args.author,
                    gender: 'H',
                    age: 12,
                    birthday: '',
                }
            }

            books.push(book);

            return book;
        }
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            console.log('parseValue');
            return new Date(value); // value from the client
        },
        serialize(value) {
            console.log('serialize');
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            console.log('parseLiteral');
            if (ast.kind === Kind.INT) {
                return new Date(ast.value) // ast value is always in string format
            }
            return null;
        },
    }),
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
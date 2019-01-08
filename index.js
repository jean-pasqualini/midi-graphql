const { ApolloServer, gql } = require('apollo-server');


// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
    {
        title: 'Harry Potter and the Chamber of Secrets',
        author: {
            firstname: 'J.K',
            lastname: 'Rolins',
            gender: 'F',
            age: 53,
            date: '',
            fullname: function () {
                return this.firstname + ' ' + this.lastname;
            }
        },
    },
    {
        title: 'Jurassic Park',
        author: {
            firstname: 'Michael',
            lastname: 'Crichton',
            age: 26,
            gender: 'H',
            birthday: '',
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

  # This "Book" type can be used in other type declarations.
  type Author {
    firstname: String
    lastname: String
    fullname: String
    gender: String
    age: Int
    birthday: String
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
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
    Query: {
        books(obj, args, context, info) {
            if (typeof args.gender !== "undefined") {
                return books.filter(book => book.author.gender === args.gender);
            }
            return books;
        },
    },
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
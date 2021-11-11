const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Performer = require('./models/performer');
const options = { useNewUrlParser: true, useUnifiedTopology: true };
require('dotenv').config();
const app = express();
const cors = require('cors');
const _ = require('lodash');
let port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`

    type Performer {
      _id: ID!
      name: String!
      group: String!
      specialty: [String!]!
      photo: String!
      gender: String!
      bio: String!
      link: String!
    }

    input PerformerInput {
      name: String!
      group: String!
      specialty: [String!]!
      photo: String!
      gender: String!
      bio: String!
      link: String!
    }

    type Query {
      performers: [Performer!]!
      performersCustom(gender:[String], group:[String], limit:Int):[Performer!]!
    }

    type RootMutation {
      createPerformer(performerInput: PerformerInput): Performer
    }

    schema {
      query: Query
      mutation: RootMutation
    }
  `),
    rootValue: {
      performers: () => {
        return Performer.find()
          .then(performers => {
            console.log(performers);
            return performers.map(performer => {
              return { ...performer._doc };
            });
          })
          .catch(error => {
            throw error;
          });
      },
      performersCustom: args => {
        let newArgs = { ...args };
        delete args.limit;
        return Performer.find(args)
          .then(performers => {
            let results = _.sampleSize(performers, newArgs.limit);
            return results.map(performer => {
              return { ...performer._doc };
            });
          })
          .catch(error => {
            throw error;
          });
      },
      createPerformer: args => {
        const performer = new Performer({
          name: args.performerInput.name,
          group: args.performerInput.group,
          specialty: args.performerInput.specialty,
          photo: args.performerInput.photo,
          gender: args.performerInput.gender,
          bio: args.performerInput.bio,
          link: args.performerInput.link,
        });
        return performer
          .save()
          .then(results => {
            console.log('Saved to mongo!', results);
            return { ...results._doc };
          })
          .catch(error => {
            console.log(error);
            throw error;
          });
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect(process.env.MONGOOSE_URI, options)
  .then(() => {
    console.log('Mongo connected!');
    app.listen(port, () => {
      console.log(`Listening on ${port}`);
    });
  })
  .catch(error => {
    console.error(error);
  });

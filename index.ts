const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Recipe = require('./models/recipe.ts');
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

    type Recipe {
      _id: ID!
      name: String!
      group: String!
      specialty: String!
      photo: String!
      gender: String!
      bio: String!
      link: String!
    }

    input RecipeInput {
      name: String!
      group: String!
      specialty: String!
      photo: String!
      gender: String!
      bio: String!
      link: String!
    }

    type Query {
      recipes: [Recipe!]!
      recipesCustom(gender:[String], group:[String], limit:Int):[Recipe!]!
    }

    type RootMutation {
      createRecipe(recipeInput: RecipeInput): Recipe
    }

    schema {
      query: Query
      mutation: RootMutation
    }
  `),
    rootValue: {
      recipes: () => {
        return Recipe.find()
          .then(recipes => {
            console.log(recipes);
            return recipes.map(recipe => {
              return { ...recipe._doc };
            });
          })
          .catch(error => {
            throw error;
          });
      },
      recipesCustom: args => {
        let newArgs = { ...args };
        delete args.limit;
        return Recipe.find(args)
          .then(recipes => {
            let results = _.sampleSize(recipes, newArgs.limit);
            return results.map(recipe => {
              return { ...recipe._doc };
            });
          })
          .catch(error => {
            throw error;
          });
      },
      createRecipe: args => {
        const recipe = new Recipe({
          name: args.recipeInput.name,
          group: args.recipeInput.group,
          specialty: args.recipeInput.specialty,
          photo: args.recipeInput.photo,
          gender: args.recipeInput.gender,
          bio: args.recipeInput.bio,
          link: args.recipeInput.link,
        });
        return recipe
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

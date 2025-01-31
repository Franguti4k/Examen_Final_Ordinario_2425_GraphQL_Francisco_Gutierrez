//Programador: Francisco Javier Gutierrez Gallego
export const schema = `#graphql
    type Restaurant {
        id: ID!
        name:String!
        direccion: String!
        phone: String!
        temp: Int!
        time: String!
    }


    type Query  {
        getRestaurants: [Restaurant!]!
        getRestaurant (id: String!): Restaurant
    }

    type Mutation  {
        addRestaurant(name: String!, direccion: String!, city: String!, phone: String!): Restaurant!
        deleteRestaurant(id:String!): Boolean!
        
    }





`
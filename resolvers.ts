//Programador: Francisco Javier Gutierrez Gallego
import { Collection, ObjectId } from "mongodb"
import { GraphQLError } from "graphql";
import { APICity, APIClima, APIPhone, APITime, RestaurantModel } from "./types.ts";


type Context = {RestaurantsCollection: Collection<RestaurantModel>}
type getRestaurantQueryArgs = {id:string}
type deleteRestaurantMutationArgs = {id:string}
type addRestaurantMutationArgs = {
    name: string,
    direccion: string,
    city: string,
    phone: string
}




export const resolvers = {
    Query:{
        getRestaurants: async(_:unknown, __:unknown,ctx:Context):Promise<RestaurantModel[]> => await ctx.RestaurantsCollection.find().toArray(),
        getRestaurant: async(_:unknown, args:getRestaurantQueryArgs, ctx:Context):Promise<RestaurantModel | null> => {
            return await ctx.RestaurantsCollection.findOne({_id: new ObjectId(args.id)})
        }
    },

    Mutation:{
        deleteRestaurant: async(_:unknown, args: deleteRestaurantMutationArgs, ctx: Context):Promise<boolean> => {
            const {deletedCount} = await ctx.RestaurantsCollection.deleteOne({_id: new ObjectId(args.id)})
            return deletedCount === 1
        },
        addRestaurant: async(_:unknown, args: addRestaurantMutationArgs, ctx:Context):Promise<RestaurantModel> => {
            const {name, direccion, city, phone} = args
            const restaurantExist = await ctx.RestaurantsCollection.countDocuments({phone:phone})
            if(restaurantExist >=1) throw new GraphQLError("Restaurant already exist")
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("API KEY Not Provided")
            const urlPhone = `https://api.api-ninjas.com/v1/validatephone?number=${phone}`
            const dataPhone = await fetch(urlPhone, {headers:{"X-Api-Key":API_KEY}})
            if(dataPhone.status !== 200) throw new GraphQLError("API PHONE Ninja Error")
            const responsePhone:APIPhone = await dataPhone.json()
            console.log(responsePhone.is_valid)
            if(!responsePhone.is_valid) throw new GraphQLError("Phone not valid")
            const {insertedId} = await ctx.RestaurantsCollection.insertOne({
                name,
                direccion,
                city,
                phone
            })
            return {
                _id:insertedId,
                name,
                direccion,
                city,
                phone
            }
        }

    },

    Restaurant:{
        id: (parent: RestaurantModel) => parent._id!.toString(),
        temp: async(parent: RestaurantModel):Promise<number> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("API KEY Not Provided")
            const city = parent.city
            console.log(city)
            const urlCity =`https://api.api-ninjas.com/v1/city?name=${city}`
            const dataCity = await fetch(urlCity, {headers:{"X-Api-Key":API_KEY}})
            if(dataCity.status !== 200) throw new GraphQLError("API CITY Ninja Error")
            const responseCityArray:APICity[] = await dataCity.json()
            const responseCity = responseCityArray[0]
            const urlClima = `https://api.api-ninjas.com/v1/weather?lat=${responseCity.latitude}&lon=${responseCity.longitude}`
            const dataClima = await fetch(urlClima, {headers:{"X-Api-Key":API_KEY}})
            if(dataClima.status !== 200) throw new GraphQLError("API CLIMA Ninja Error")
            const responseClima:APIClima = await dataClima.json()
            return responseClima.temp
        },
        direccion: async(parent: RestaurantModel):Promise<string> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("API KEY Not Provided")
            const city = parent.city
            const urlCity =`https://api.api-ninjas.com/v1/city?name=${city}`
            const dataCity = await fetch(urlCity, {headers:{"X-Api-Key":API_KEY}})
            if(dataCity.status !== 200) throw new GraphQLError("API CITY Ninja Error")
            const responseCityArray:APICity[] = await dataCity.json()
            const responseCity = responseCityArray[0]
            const country = responseCity.country
            const direccionFormat = `${parent.direccion} ${city} ${country}`
            return direccionFormat
        },
        time: async(parent: RestaurantModel):Promise<string> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("API KEY Not Provided")
            const city = parent.city
            const urlCity =`https://api.api-ninjas.com/v1/city?name=${city}`
            const dataCity = await fetch(urlCity, {headers:{"X-Api-Key":API_KEY}})
            if(dataCity.status !== 200) throw new GraphQLError("API CITY Ninja Error")
            const responseCityArray:APICity[] = await dataCity.json()
            const responseCity = responseCityArray[0]
            console.log(responseCity.latitude)
            console.log(responseCity.longitude)
            const urlTime = `https://api.api-ninjas.com/v1/worldtime?lat=${responseCity.latitude}&lon=${responseCity.longitude}`
            const dataTime = await fetch(urlTime, {headers:{"X-Api-Key":API_KEY}})
            if(dataTime.status !== 200) throw new GraphQLError("API TIME Ninja Error")
            const responseTime:APITime = await dataTime.json()
            const hour = responseTime.hour
            const minute = responseTime.minute
            const timeFormat:string = `${hour} : ${minute}`
            
            console.log(timeFormat)
            return timeFormat
        }
    }
}

//Programador: Francisco Javier Gutierrez Gallego
import {OptionalId} from "mongodb" 

export type RestaurantModel = OptionalId<{
    name:string,
    direccion: string,
    city: string,
    phone: string
}>

export type APICity = {
    latitude: number,
    longitude:number,
    country: string

}
export type APIClima = {
    temp:number
}

export type APITime = {
    hour:string,
    minute:string
}

export type APIPhone = {
    is_valid:boolean
}

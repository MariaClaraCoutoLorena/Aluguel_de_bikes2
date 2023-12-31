import { Bike } from "./bike";
import { Rent } from "./rent";
import { User } from "./user";
import crypto from 'crypto'
import bcrypt from 'bcrypt';
export class App {
    users: User[] = []
    bikes: Bike[] = []
    rents: Rent[] = []
    salt: String = bcrypt.genSaltSync(10)

    findUser(email: string): User {
        return this.users.find(user => user.email === email)
    }

    registerUser(user: User): string {
        for (const rUser of this.users) {
            if (rUser.email === user.email) {
                throw new Error('Duplicate user.')
            }
        }
        user.password = bcrypt.hashSync(user.password, this.salt)
        const newId = crypto.randomUUID()
        user.id = newId
        this.users.push(user)
        return newId
    }

    registerBike(bike: Bike): string {
        const newId = crypto.randomUUID()
        bike.id = newId
        this.bikes.push(bike)
        return newId
    }

    verificaUser(email: string, password: string): User{
        for(let user of this.users){
            if(user.email==email){
                if(user.password=bcrypt.hashSync(password, this.salt)) {
                    console.log("Usuário logado com sucesso!")
                    return user
                }else throw new Error("Senha incorreta!")
            }
        }
        throw new Error("Este email não está cadastrado.")
    }

    removeUser(email: string): void {
        const userIndex = this.users.findIndex(user => user.email === email)
        if (userIndex !== -1) {
            this.users.splice(userIndex, 1)
            return
        }
        throw new Error('User does not exist.')
    }
    
    rentBike(bikeId: string, userEmail: string, startDate: Date, endDate: Date): void {
        const bike = this.bikes.find(bike => bike.id === bikeId)
        if (!bike) {
            throw new Error('Bike not found.')
        }
        const user = this.findUser(userEmail)
        if (!user) {
            throw new Error('User not found.')
        }
        const bikeRents = this.rents.filter(rent =>
            rent.bike.id === bikeId && !rent.dateReturned
        )
        const newRent = Rent.create(bikeRents, bike, user, startDate, endDate)
        this.rents.push(newRent)
    }

    returnBike(bikeId: string, userEmail: string) {
        const today = new Date()
        const rent = this.rents.find(rent => 
            rent.bike.id === bikeId &&
            rent.user.email === userEmail &&
            rent.dateReturned === undefined &&
            rent.dateFrom <= today
        )
        if (rent) {
            rent.dateReturned = today
            return
        }
        throw new Error('Rent not found.')
    }
    listBikes() {
        console.log("Bikes:")
        for(let bike of this.bikes){
            console.log("- "+bike.name)
        }
    }
    listUsers() {
        console.log("Usuários:")
        for(let user of this.users){
            console.log("- "+user.name+", "+ user.email)
        }
    }
    listRents() {
        let datainicio, datafim
        console.log("Reservas:")
        for(let rent of this.rents){
            datainicio = rent.dateFrom.getDate()+"/"+(rent.dateFrom.getMonth()+1)+"/"+rent.dateFrom.getFullYear()
            datafim = rent.dateTo.getDate()+"/"+(rent.dateTo.getMonth()+1)+"/"+rent.dateTo.getFullYear()
            console.log("- Bike "+rent.bike.name+", reservada por "+rent.user.name+" de "+datainicio+" até "+datafim)
        }
    }
}
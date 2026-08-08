import { v4 as uuid } from 'uuid'

const users = [
    {
        id: uuid(),
        username: "vincent123",
        email: "vincent@mail.com",
        password: "123",
        avatar: "https://placehold.co/150"
    },
    {
        id: uuid(),
        username: "ncent123",
        email: "ncent@mail.com",
        password: "123",
        avatar: "https://placehold.co/150"
    },
    {
        id: uuid(),
        username: "admin123",
        email: "admin@mail.com",
        password: "123",
        avatar: "https://placehold.co/150"
    }
]

const images = [
    {
        id: uuid(),
        name: "Breakfast",
        imageLocation: null,
        size: 300,
        user: {
            id: uuid(),
            username: "vincent123",
            email: "vincent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Lunch",
        imageLocation: null,
        size: 250,
        user: {
            id: uuid(),
            username: "vincent123",
            email: "vincent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Dinner",
        imageLocation: null,
        size: 350,
        user: {
            id: uuid(),
            username: "vincent123",
            email: "vincent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Works",
        imageLocation: null,
        size: 100,
        user: {
            id: uuid(),
            username: "cent123",
            email: "ncent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Practice",
        imageLocation: null,
        size: 100,
        user: {
            id: uuid(),
            username: "admin123",
            email: "admin@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Travel",
        imageLocation: null,
        size: 300,
        user: {
            id: uuid(),
            username: "vincent123",
            email: "vincent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Eat",
        imageLocation: null,
        size: 100,
        user: {
            id: uuid(),
            username: "vincent123",
            email: "vincent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Buying",
        imageLocation: null,
        size: 50,
        user: {
            id: uuid(),
            username: "admin123",
            email: "admin@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Selling",
        imageLocation: null,
        size: 50,
        user: {
            id: uuid(),
            username: "ncent123",
            email: "ncent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Breakfast 1",
        imageLocation: null,
        size: 300,
        user: {
            id: uuid(),
            username: "ncent123",
            email: "vincent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: uuid(),
        name: "Breakfast 2",
        imageLocation: null,
        size: 300,
        user: {
            id: uuid(),
            username: "admin123",
            email: "vincent@mail.com",
            password: "123",
            avatar: "https://via.placeholder.com/100"
        },
        createdAt: new Date(),
        updatedAt: new Date()
    }
]

export {
    users, images
}
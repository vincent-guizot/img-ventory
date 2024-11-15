import ClassLayout from '../layouts/ClassLayout'

// Pages
import Home from '../pages/classes/Home'
import Edit from '../pages/classes/Edit'
import Details from '../pages/classes/Details'
import Add from '../pages/classes/Add'

export default {
    path: "classes",
    element: <ClassLayout/>,
    children:[
        {
            path: "",
            element: <Home></Home>
        },{
            path: "add",
            element: <Add></Addd>
        },
        {
            path: "edit/:id",
            element: <Edit></Edit>
        }, {
            path: "details/:id",
            element: <Details></Details>
        }
    ]
}
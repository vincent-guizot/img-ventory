import ClassLayout from '../layouts/ClassLayout'

// Pages
import Home from '../pages/classes/Home'
import Edit from '../pages/classes/Edit'
import Details from '../pages/classes/Details'

export default {
    path: "classes",
    element: <ClassLayout/>,
    children:[
        {
            path: "",
            element: <Home></Home>
        },{
            path: "edit/:id",
            element: <Edit></Edit>
        }, {
            path: "details/:id",
            element: <Details></Details>
        }
    ]
}
import { createRouter, createWebHistory } from 'vue-router'
import MainMenu from "@/components/MainMenu.vue";
import Board from "@/components/Board.vue";
import SignUp from "@/components/SignUp.vue";
import Register from "@/components/Register.vue";
import FileDiractory from "@/components/FileDiractory.vue";
import Help from "@/components/Help.vue"
import CanvasBoard from "@/components/CanvasBoard.vue";

const routes = [
    { path: '/', component: MainMenu },
    { path: '/canva', component: Board },
    { path: '/signup', component: SignUp },
    { path: '/register', component: Register },
    { path: '/files', component: FileDiractory },
    { path: '/help', component: Help },
    {
        path: '/board/:boardID',
        name: 'board',
        component: CanvasBoard,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

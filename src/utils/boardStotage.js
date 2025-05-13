import { initDB, insertData, getDataByKey, getAllData } from "@/utils/db.js";


const DB_NAME = "Database"
const STORE_NAME = "Boards"


export const getBoard = async (id) => {
    return getDataByKey(DB_NAME, STORE_NAME, id)
}


export const insertBoard = async (id, board) => {
    return insertData(DB_NAME, STORE_NAME, id, board)
}

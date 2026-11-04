const pool = require('../config/db');

const columnas = `idEspecie as "idEspecie", tipo`;

async function getEspecies(){
    const {rows} = await pool.query(`select ${columnas} from Especie order by idEspecie`);
    return rows;
}

async function getEspecie(id){
    const {rows} = await pool.query(`
    select ${columnas} from Especie where $1 = idEspecie`, [id]);
    return rows[0];
}

async function crearEspecie({tipo}){
    const { rows } = await pool.query(`
    insert into Especie (tipo)
    values ($1) returning ${columnas}`, [tipo]
    );
    return rows[0];
}

async function eliminarEspecie(id){
    const {rowCount} = await pool.query(`
    delete from Especie where idEspecie = $1`, [id]);
    return rowCount > 0;
}

module.exports = {getEspecie, getEspecies, crearEspecie, eliminarEspecie}
const pool = require('../config/db');

const columnas = `m.idMascota AS "idMascota", m.nombre, m.idTutor AS "idTutor",
  m.idEspecie AS "idEspecie", e.tipo AS "especie", m.anioNacimiento AS "anioNacimiento", m.peso`;

async function getMascotasPorTutor(idTutor){
    const {rows} = await pool.query(
        `select ${columans} 
        from Mascota m join Especie e on e.idEspecie m.idEspecie
        where ($1::int is null or m.idTutor = $1)
        order by m.idMascota`,
        [idTutor]
    );
    return rows;
}
async function getMascota(idMascota, idTutor){
    const {rows} = await pool.query(
        `select ${columnas} 
        from Mascota m join Especie e on e.idEspecie = m.idEspecie
        where m.idMascota = $1 and ($2::int is null or $2 = m.idTutor)`,
        [idMascota, idTutor]
    );
    return rows;
}
// Crear la mascota con su ficha clinica en la misma transacción
async function crearMascota({nombre, idTutor, idEspecie, anioNacimiento, peso}){
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const {rows} = await pool.query(
            `insert into Mascota(nombre, idTutor, idEspecie, anioNacimiento, peso)
            values ($1,$2,$3,$4,$5)
            returning idMascota as "idMascota"`,
            [nombre, idTutor, idEspecie, anioNacimiento ?? null, peso ?? null]
        );
        await client.query('insert into FichaClinica (idMascota) values ($1)', [rows[0].idMascota]);
        await client.query('COMMIT');
        return rows[0].idMascota;
    } catch(e){
        await client.query('ROLLBACK');
        throw e;
    }finally {
        client.release();
    }
}
async function actualizarMascota(id, { nombre, idEspecie, anioNacimiento, peso }, idTutor){
    const {rowCount} = await pool.query(
        `update Mascota
        set nombre = $1, idEspecie = $2, anioNacimiento = $3, peso = $4
        where idMascota = $5 and ($6:: int is null or $6 = idTutor)`,
        [nombre, idEspecie, anioNacimiento ?? null, peso ?? null, id, idTutor]
    );
    return rowCount > 0;
}
async function eliminarMascota(id){
    const {rowCount} = await pool.query(
        `delete from Mascota where idMascota = $1`,
        [id]
    );
    return rowCount >0;
}

module.exports = {getMascotasPorTutor, getMascota, crearMascota, actualizarMascota, eliminarMascota}




















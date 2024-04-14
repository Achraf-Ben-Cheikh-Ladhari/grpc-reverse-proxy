const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
// charge le service grpc et le fichier.proto
const PROTO_PATH = __dirname + '/my-service.proto';
const mysql = require('mysql');
//paramètres de connexion à changer
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'achraf',
    password: 'ladhari02',
    database: 'db'
});
//
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).myservice;
// Définit le service grpc
const myService = {
    getRecord: (call, callback) => {
        const id = call.request.id;
        // Requète à la base de données pour obtenir le record avec l'ID spécifié
        connection.query('SELECT * FROM record WHERE id = ?', [id], (error, results) => {
            if (error) {
                console.error(error);
                callback(error);
                return;
            }
            // Renvoie les données au client
            const record = results[0];
            callback(null, { record: record.id + ' '+ record.name});
        });
    },
};
// Démarre le serveur grpc
const server = new grpc.Server();
server.addService(serviceProto.MyService.service, myService);
server.bindAsync(
    '127.0.0.1:50051',
    grpc.ServerCredentials.createInsecure(),
    () => {
        console.log('listening on port 50051');
        server.start()
    }
)
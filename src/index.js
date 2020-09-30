const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const path = require("path");
const puerto = 3000;
const brain = require('brain.js');
let entranamientonet;
const db = require('../database/firebase-conn')
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/views/index.html");
});
app.post("/consultar", async function(req, res) {
    console.log("llega la información", req.body);
    datoPremier(req.body.twit);
    let resultado = await ejecutar(req.body.twit);
    res.render('index', { resultado });
});

function codificar(arg) {
    return arg.split('').map(x => x.charCodeAt(0) / 400);
}

function procesodeEntrenamiento(data) {
    return data.map(
        (d) => {
            return {
                input: codificar(d.input),
                output: d.output,
            }
        }
    );
};


function entrenamiento(data) {
    let net = new brain.NeuralNetwork();
    net.train(
        procesodeEntrenamiento(data, {
            iterations: 1,
            log: true,
            learningRate: 0.1,
            timeout: 500,
        })
    );
    entranamientonet = net.toFunction();
    console.log('Ha finalizado el entrenamiento');
};

function ejecutar(entrada_usuario) {
    let resultado = entranamientonet(codificar(ajustartexto(entrada_usuario)));
    let salida;
    console.log('resultadosssss', resultado);
    let porcentaje = resultado.equipoEuropa * 100;
    let valor = porcentaje.toFixed(17)
    console.log('prueba porcentaje', valor);
    resultado.equipoEuropa > resultado.equipoNoEuropa ?
        (salida = "Es equipo de la 5 ligas Europeas") : (salida = "No es equipo de la 5 ligas Europeas");
    return salida;
}

const datoPremier = (dato_cliente) => {
    db.collection("Premier").get().then((querySnapshot) => {
        querySnapshot.forEach((docs) => {
            let mensaje = String(docs._fieldsProto.mensaje.stringValue);
            let tipo = String(docs._fieldsProto.tipo.stringValue);
            if ([mensaje].includes(dato_cliente)) {
                obtenerDataEntranamiento(mensaje);
                console.log('Equipo ok', mensaje);
            }
        })

    })

}




function obtenerDataEntranamiento(mensaje) {

    let trainingData = [{
            input: `${mensaje}`,
            output: { equipoEuropa: 1 }
        },
        {
            input: "River",
            output: { equipoNoEuropa: 1 }
        },
        {
            input: "Boca juniors",
            output: { equipoNoEuropa: 1 }
        },
        {
            input: "Nacional",
            output: { equipoNoEuropa: 1 }
        }, {
            input: "Atletico Mineiro",
            output: { equipoNoEuropa: 1 }
        }
    ];


    longitudtext = trainingData.reduce((a, b) =>
        a.input.length > b.input.length ? a : b
    ).input.length;
    for (let i = 0; i < trainingData.length; i++) {
        trainingData[i].input = ajustartexto(trainingData[i].input);
    }
    return trainingData;


}
entrenamiento(obtenerDataEntranamiento());

function ajustartexto(string) {
    while (string.length < longitudtext) {
        string += " ";
    }
    return string;
}
datoPremier();

console.log(ejecutar('ofertas de publicidad'));

app.listen(puerto, () => {
    console.log(`se esta escuchando en el puerto ${puerto}`);
})
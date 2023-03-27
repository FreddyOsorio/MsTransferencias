import { Controller, Post, Req, Get} from '@nestjs/common';
import { Request } from 'express';

const crypt = require("crypto");

const DER_SECRET_PREFIX = '302e020100300506032b657004220420';
const DER_PUBLIC_PREFIX = '302a300506032b6570032100';

@Controller()
export class LlavesController {

    @Get('/obtieneLlavesProducto')
    getLLaves(@Req() req: Request) {
        var cuerpo = req.body;
        var tipoProducto = cuerpo.tipoProducto;
        var numeroProducto = cuerpo.numeroProducto;

        //Obtiene la llave que le corresponde
        var handlerWallet = tipoProducto+':'+numeroProducto+'@Qik';
        var llaveUsuario = this.getLlavesXNombre(handlerWallet);
        //Crea response
        var data = {
            nombreLlaves: llaveUsuario.nombreLlave,
            llavePublica: llaveUsuario.publicRaw,
            schema: llaveUsuario.schema,
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_OBTENER_LLAVES', descripcion: 'Se obtuvo la llave correctamente'}
        };

        return data;
  }

    @Post('/generaLlavesXProducto')
    generaLlaves(@Req() req: Request) {
        var cuerpo = req.body;
        var tipoProducto = cuerpo.tipoProducto;
        var numeroProducto = cuerpo.numeroProducto;

        var usuario = this.getDatosUsuario(cuerpo.userId);
        var keyPair = this.generateLedgerKeyPair();
        //console.log("llaves ", keyPair);

        
        //Devuelve formato sólo de fecha pero en el formato regional actual ejemplo: 24/8/2019
        const f = new Date();
        //console.log(f.toLocaleDateString());

        //Crea response
        var data = {
            nombreLlaves: tipoProducto+':'+numeroProducto+'@Qik',
            llavePrivada: keyPair.secretRaw,
            llavePublica: keyPair.publicRaw,
            schema: keyPair.schema,
            fecha: f.toLocaleDateString(),
            estatus: {codigo: 'MS_TRANSLINEA_EXITO_CREAR_LLAVES', descripcion: 'Se crearon las llaves correctamente'}
        };
        

      return data;
    }

    //Metódo que busca la información del usuario
    getDatosUsuario(idUsuario){
        var nombre;
        var apellido;
        if(idUsuario <  501){
            nombre = "Mario";
            apellido = "Salas";
        }else{
            nombre = "Pedro";
            apellido = "Games";
        }
        return {
            idUsuario: idUsuario,
            nombre: nombre,
            apellido: apellido
        }
    }

    //Metódo que busca las llaves
    getLlavesXNombre(nombreLlave){

        //Aqui debe obtener de KMS las llaves por el nombrede la llave 
        var keyPair = this.generateLedgerKeyPair();
        return {
            nombreLlave: nombreLlave,
             publicRaw: keyPair.publicRaw,
             schema: keyPair.schema
           };
    }

    //Metódo que genera las Llaves
    generateLedgerKeyPair() {
        // Generate random ed25519 keys
        const keyPairDer = crypt.generateKeyPairSync("ed25519");
      
        // Export secret and public keys in der format
        const secretDer = keyPairDer.privateKey
          .export({ format: "der", type: "pkcs8" })
          .toString("hex");
      
        const publicDer = keyPairDer.publicKey
          .export({ format: "der", type: "spki" })
          .toString("hex");
      
          const secretRaw = Buffer.from(
            secretDer.slice(DER_SECRET_PREFIX.length),
            'hex',
          ).toString('base64')
          
          const publicRaw = Buffer.from(
            publicDer.slice(DER_PUBLIC_PREFIX.length),
            'hex',
          ).toString('base64')
        
        return {
         schema: "ed25519",
          secretRaw,
          publicRaw
        };
    }
}
 
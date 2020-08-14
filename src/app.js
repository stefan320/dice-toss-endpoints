const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
app.use('/', router);

const port = 3000;

const user = {
    username : 'robouser',
    password : 'MyPassw0rD',
    balance : 2000,
    currency : 'EUR',
    betHistory: []
};

router.get('/get-user/:username', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if(req.params.username === user.username){
        res.send(JSON.stringify(user));
    } else {
        res.send({error: 'User does not exist.'});
    }
});

router.post('/roll-dice',[
    check('username').isString().isLength({min: 1}),
    check('betAmount').isNumeric(),
    check('sideSelected').isNumeric()
], (req, res) => {


    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    let responseBody = {};

    if(req.body && req.body.username && req.body.betAmount  && req.body.sideSelected){

        if(req.body.username === user.username){

            if(user.balance > req.body.betAmount){
                user.balance = user.balance - req.body.betAmount;
                const betResult = Math.floor(Math.random() * Math.floor(6)) + 1;
                let amountWon = 0;

                if(req.body.sideSelected === betResult){
                    //Won !
                    amountWon = req.body.betAmount * 5;
                    user.balance = user.balance + (amountWon);
                    responseBody.result = 'WON';
                } else {
                    // Lost !
                    //betAmount already deducted
                    responseBody.result = 'LOST';
                    responseBody.sideGenerated = betResult;
                }

                //Updating user bet history
                user.betHistory.push({
                    dateTime : Date.now(),
                    result : responseBody.result,
                    stake : req.body.betAmount,
                    sideSelected : req.body.sideSelected,
                    sideGenerated : betResult,
                    amountWon : amountWon
                });
            } else {
                responseBody = {errors: 'Insufficient funds in your balance to place ' + user.currency + ' ' + req.body.betAmount};
            }

        } else {
            responseBody = {errors: 'User does not exist.'};
        }

    } else {
        responseBody = {errors: 'Some of the parameters provided are not defined. Make sure you post the following params : username : string, betAmount : number and sideSelected : number from 1 to 6.'};
    }

    res.send(responseBody);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
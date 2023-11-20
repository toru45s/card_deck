const Koa = require('koa');
const logger = require('koa-morgan');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const formidable = require('koa2-formidable');
const cors = require('@koa/cors');
const router = new Router();
const app = new Koa();
const fs = require('fs');
const https = process.env.REACT_APP_DEV ? require('http') : require('https');

require('./routes')(router);
require("./mongodb")();

app
    .use(cors({exposeHeaders: 'Content-Range', credentials: true})) //#TODO set origin for production
    .use(formidable())
    .use(bodyParser({
        formLimit: '16mb',
        jsonLimit: '16mb'
    }))
    .use(logger('tiny'))
    .use(router.routes())
    .use(router.allowedMethods());

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/cardtherapy.online-0001/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/cardtherapy.online-0001/cert.pem', 'utf8')
};

const server = https.createServer(options,app.callback());
const io = require('socket.io')(server,options);

io.on('connection', socket => {
    socket.on('userConnected', data => {
        socket.join(data.userId);
        if (!data.isGuest) {
            socket.to("master_" + data.userId).emit('logout'); socket.join("master_"+data.userId);
        } else {
            const connectedGuests = socket.adapter.sids;
            if (Object.keys(connectedGuests).length <= 2 || data.multipleAllowed) {
                socket.to("master_" + data.userId).emit('guestConnected');
            } else {
                socket.emit('connectionBlocked');
                socket.disconnect();
            }
        } });
    socket.on('cardPlaced', data => { socket.to(data.userId).emit('syncCard', data.card) });
    socket.on('moveBG', data => { socket.to(data.userId).emit('syncBG', data.pos); });
    socket.on('syncDecks', data => { socket.to(data.userId).emit('syncDecks', data.decks); });
    socket.on('holding', data => { socket.to(data.userId).emit('syncHold', data.card) });
    socket.on('syncShuffle', data => { socket.to(data.userId).emit('syncShuffle', data.deckId) });
    socket.on('syncSpread', data => { socket.to(data.userId).emit('syncSpread', data.deckId) });
    socket.on('renderedDeck', data => { socket.to(data.userId).emit('syncRenderedDeck', data.deck) });
    socket.on('removedDeck', data => { socket.to(data.userId).emit('removeDeck', data.deck) });
    socket.on('cardUndone', data => {
        const undoneCard = data.card;
        undoneCard.x = data.newX;
        undoneCard.y = data.newY;
        socket.to(data.userId).emit('syncCard', undoneCard)
    });
    socket.on('cardForms', data => { socket.to(data.userId).emit('syncCardForms', data.cardId) });
    socket.on('updateForm', data => { socket.to(data.userId).emit('syncUpdateForms', {cardId: data.cardId, form: data.form}) });
    socket.on('cardFlipped', data => {socket.to(data.userId).emit('syncFlipCard', data.card)});
    socket.on('cardZoomed', data => {socket.to(data.userId).emit('syncZoomCard', {card: data.card, zoom: data.zoom})});
    socket.on('syncBackgrounds', data => {socket.to(data.userId).emit('syncGuestBackgrounds', data.backgrounds)});
    socket.on('activateBG', data => {socket.to(data.userId).emit('syncActiveBG', data.background)});
    socket.on('logoutGuests', data => {socket.to(data.userId).emit('logoutGuests')});
    socket.on('logout', data => {socket.to(data.userId).emit('logoutGuests')});
});





module.exports = server;

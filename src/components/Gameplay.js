import React, { Component } from "react";
import ReactDOM from "react-dom";
import { MainContext } from "../Context";
import { toast } from "react-toastify";
import DeckSelector from "./DeckSelector";
import Account from "./account/Account";
import Shop from "./shop/Shop";
import DeckStarter from "./DeckStarter";
import TrialEndedMessage from "./TrialEndedMessage";
import Deck from "./js/deck.js"; // this is an open source script I found on github. I modified it a bit to suit the project but it's mostly untouched. Beware.
import html2canvas from "html2canvas";
import canvas2image from "canvas2image-2";
import { withTranslation, getLanguage } from "react-multi-lang";
import io from "socket.io-client";
import Cookies from "js-cookie";
import Lang from "./Lang";
import Tour from "reactour";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import ConfirmPrompt from "./ConfirmPrompt";
import FroalaEditorComponent from "react-froala-wysiwyg";

import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/js/plugins/align.min.js";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/js/plugins/table.min.js";
import "./css/example.css";
import "./css/Gameplay.css";
import "./css/Game.css";

class Gameplay extends Component {
  static contextType = MainContext;

  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      allDecks: [],
      activeDecks: [],
      bgRelative: null,
      bgPosition: { x: 0, y: 100 },
      dragging: false,
      draggingModal: false,
      draggableModalPosition: { x: 0, y: 0 },
      undoable: false,
      undoActions: [],
      account: false,
      shop: false,
      deckStarter: false,
      deckFilter: "",
      showDeckHint: false,
      deckHintSteps: [],
      confirmOpen: false,
      confirmTitle: "",
      onConfirm: () => {},
      hideDecksAndMenu: false,
      froalaControls: null,
      showDrawbox: false,
    };
    this.render = this.render.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.mousedownDraggableModal = this.mousedownDraggableModal.bind(this);
    this.mouseupDraggableModal = this.mouseupDraggableModal.bind(this);
    this.mousemoveDraggableModal = this.mousemoveDraggableModal.bind(this);
    this.undoActions = this.undoActions.bind(this);
    this.cardMoved = this.cardMoved.bind(this);
    this.undo = this.undo.bind(this);
    this.suggestImprovement = this.suggestImprovement.bind(this);
    this.invite = this.invite.bind(this);
    this.account = this.account.bind(this);
    this.closeAccountWindow = this.closeAccountWindow.bind(this);
    this.shop = this.shop.bind(this);
    this.closeShopWindow = this.closeShopWindow.bind(this);
    this.showDeckStarter = this.showDeckStarter.bind(this);
    this.closeDeckStarter = this.closeDeckStarter.bind(this);
    this.session = this.session.bind(this);
    this.newSession = this.newSession.bind(this);
    this.loadSession = this.loadSession.bind(this);
    this.navigationButtons = this.navigationButtons.bind(this);
    this.cardPlaced = this.cardPlaced.bind(this);
    this.syncHold = this.syncHold.bind(this);
    this.cardFlipped = this.cardFlipped.bind(this);
    this.cardZoomed = this.cardZoomed.bind(this);
    this.addDeck = this.addDeck.bind(this);
    this.reAddDeck = this.reAddDeck.bind(this);
    this.scroll = this.scroll.bind(this);
    this.addBackgrounds = this.addBackgrounds.bind(this);
    this.interfaceInfo = this.interfaceInfo.bind(this);
    this.logOut = this.logOut.bind(this);
    this.filterDecksList = this.filterDecksList.bind(this);
    this.cleanBoard = this.cleanBoard.bind(this);
    this.closeDraggableModal = this.closeDraggableModal.bind(this);
    this.toggleDeckSelectors = this.toggleDeckSelectors.bind(this);
    this.restartTutorial = this.restartTutorial.bind(this);
    this.showDeckHint = this.showDeckHint.bind(this);
    this.hideDeckHint = this.hideDeckHint.bind(this);
    this.backgroundsUpdate = this.backgroundsUpdate.bind(this);
    this.prevBG = this.prevBG.bind(this);
    this.nextBG = this.nextBG.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.handleFroalaEditor = this.handleFroalaEditor.bind(this);
    this.resetBG = this.resetBG.bind(this);

    this.refClientName = React.createRef();
    this.refClientNameLoad = React.createRef();
  }

  

  async componentDidMount() {
    const $this = this;
    const { t } = this.props;
    const deckContainer = document.getElementById("deck-container");
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("touchstart", this.onMouseDown);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("showDrawbox", () => {
      deckContainer.style.transform = "translateX(-60%) translateY(10%)";
      const deckSelector = document.getElementById("deck-selectors_wrapper");
      deckSelector.classList.add("minimized");
      const bgControls = document.getElementById("bottom_right");
      bgControls.style.display = "none";
      this.setState({ showDrawbox: true })
    });
    document.addEventListener("hideDrawbox", () => {
      deckContainer.style.transform = "translateX(-50%) translateY(10%)";
      const deckSelector = document.getElementById("deck-selectors_wrapper");
      deckSelector.classList.remove("minimized");
      const bgControls = document.getElementById("bottom_right");
      bgControls.style.display = "flex";
      this.setState({ showDrawbox: false })
    });
    deckContainer.addEventListener("wheel", this.scroll);
    deckContainer.addEventListener("cardMoved", this.cardMoved);
    deckContainer.addEventListener("cardPlaced", this.cardPlaced);
    deckContainer.addEventListener("cardZoomed", this.cardZoomed);
    deckContainer.addEventListener("cardFlipped", this.cardFlipped);
    const undoButton = document.getElementById("undo");
    undoButton.addEventListener("click", this.undo);
    document.addEventListener("keydown", (e) => {
      if (e.which === 90 && e.ctrlKey) this.undo();
    });

    const socket = io(
      process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT,
      {
        transports: ["websocket"],
        rejectUnauthorized: false,
      }
    );
    $this.setState({ socket: socket });
    socket.on("notification", (message) => {
      console.log(message);
      toast(message);
    });
    socket.emit("userConnected", {
      userId: this.context.user.id,
      isGuest: this.context.user.guest,
      multipleAllowed: this.context.user.multipleAllowed,
    });
    socket.on("guestConnected", () => {
      toast.success(t("notifications.guest_connected"));
      socket.emit("syncDecks", {
        userId: this.context.user.id,
        decks: this.state.activeDecks,
      });
    });
    socket.on("connectionBlocked", () =>
      toast.error(t("notifications.connection_blocked"))
    );
    socket.on("syncDecks", (decks) => {
      this.syncDecks(decks);
    });
    socket.on("logout", () => {
      toast(t("notifications.logged_in_another_window"));
      Cookies.remove("token");
      this.context.methods.resetUser();
      socket.close();
    });

    socket.on("logoutGuests", () => {
      toast(t("notifications.session_closed"));
      Cookies.remove("token");
      this.context.methods.resetUser();
      socket.close();
    });

    socket.on("syncBG", (data) => {
      this.syncBG(data);
    });
    socket.on("syncCard", (card) => {
      this.syncCard(card);
    });
    socket.on("syncFlipCard", (card) => {
      this.syncFlipCard(card);
    });
    socket.on("syncZoomCard", (card) => {
      this.syncZoomCard(card);
    });
    socket.on("syncCardForms", (card) => {
      this.cardForms(card);
    });
    socket.on("syncUpdateForms", (data) => {
      this.syncForm(data.cardId, data.form);
    });
    socket.on("syncShuffle", (deckId) => {
      this.syncShuffle(deckId);
    });
    socket.on("syncSpread", (deckId) => {
      this.syncSpread(deckId);
    });
    socket.on("syncRenderedDeck", (deck) => {
      this.renderDeck(deck);
    });
    socket.on("removeDeck", (deck) => {
      this.removeDeck(deck);
    });
    socket.on("syncHold", (card) => this.syncHold(card));
    socket.on("syncGuestBackgrounds", (backgrounds) =>
      this.context.methods.setBackgrounds(backgrounds)
    );
    socket.on("syncActiveBG", (background) => this.activateBG(background));

    if (!this.context.user.guest) {
      try {
        const response = await fetch(
          process.env.REACT_APP_DOMAIN +
            ":" +
            process.env.REACT_APP_NODE_PORT +
            "/getDecks",
          {
            headers: {
              "x-access-token": this.context.user.token,
            },
          }
        );
        if (!response.ok) {
          throw Error(response.statusText);
        }
        const json = await response.json();

        if (json.length > 0) {
          this.setState({ allDecks: json });
        }
      } catch (err) {
        toast.error(t("errors.gameplay.fetch_decks"));
      }
    }

    if (
      typeof this.context.user.message !== "undefined" &&
      this.context.user.message &&
      this.context.user.message.length
    ) {
      toast(this.context.user.message);
      await fetch(
        process.env.REACT_APP_DOMAIN +
          ":" +
          process.env.REACT_APP_NODE_PORT +
          "/receiveNotification",
        {
          headers: {
            "x-access-token": this.context.user.token,
          },
        }
      );
    }

    if (!Cookies.get("close_info")) {
      this.interfaceInfo();
    }

    if (!Cookies.get("close_deck_starter") && !this.context.user.guest) {
      this.showDeckStarter();
    }

    const openji = localStorage.getItem("isopen_poup");
    if (openji) {
      this.setState({ deckStarter: true, shop: false });
    }
  }

  componentDidUpdate(props, state) {
    if (!this.state.dragging) {
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
      document.removeEventListener("touchmove", this.onMouseMove);
      document.removeEventListener("touchend", this.onMouseUp);
    }
  }

  onKeyDown(e) {
    const { t } = this.props;
    e = e || window.event;
    let newX = this.state.bgPosition.x;
    let newY = this.state.bgPosition.y;

    if (e.keyCode == "38") {
      // up arrow
      newY = newY + 200;
    } else if (e.keyCode == "40") {
      // down arrow
      newY = newY - 200;
    } else if (e.keyCode == "37") {
      // left arrow
      newX = newX + 200;
    } else if (e.keyCode == "39") {
      // right arrow
      newX = newX - 200;
    } else if (
      !process.env.REACT_APP_DEV &&
      (e.keyCode == "F5" || e.keyCode == "116")
    ) {
      if (!window.confirm(t("gameplay.refresh_confirm"))) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    // else if (e.keyCode == '107') { // plus
    //     this.zoomPlus();
    //     return false;
    // }
    // else if (e.keyCode == '109' || e.keyCode == '189') { // minus
    //     this.zoomMinus();
    //     return false;
    // }

    const stage = document.getElementById("deck-container");
    if (stage) {
      const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
      if (
        (stage.getBoundingClientRect().top >=
          stage.getBoundingClientRect().height / 6 / scale &&
          newY > this.state.bgPosition.y) ||
        (stage.getBoundingClientRect().bottom <=
          stage.getBoundingClientRect().height / 2 / scale &&
          newY < this.state.bgPosition.y)
      ) {
        newY = this.state.bgPosition.y;
      }
      if (
        (stage.getBoundingClientRect().right <=
          stage.getBoundingClientRect().width / 2 / scale &&
          stage.getBoundingClientRect().left <=
            stage.getBoundingClientRect().width / scale &&
          newX < this.state.bgPosition.x) ||
        (stage.getBoundingClientRect().left >= 250 / scale &&
          stage.getBoundingClientRect().right >=
            (stage.getBoundingClientRect().width - 250) / scale &&
          newX > this.state.bgPosition.x)
      ) {
        newX = this.state.bgPosition.x;
      }

      this.setState({
        bgPosition: {
          x: newX,
          y: newY,
        },
      });
      this.syncBG({ x: newX, y: newY });
      this.state.socket.emit("moveBG", {
        userId: this.context.user.id,
        pos: { x: newX, y: newY },
      });
    }
  }

  // calculate relative position to the mouse and set dragging=true
  onMouseDown(e) {
    // only right mouse button
    const pos = this.state.bgPosition;
    if (
      (e.target.id !== "deck-container" &&
        e.target.className !== "game-wrapper") ||
      (e.which !== 3 &&
        e.button !== 2 &&
        e.which !== 1 &&
        e.type !== "touchstart")
    )
      return;

    if (e.type === "mousedown") {
      this.setState({
        dragging: true,
        bgRelative: {
          x: e.pageX - pos.x,
          y: e.pageY - pos.y,
        },
      });
      e.stopPropagation();
      e.preventDefault();
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    } else {
      this.setState({
        dragging: true,
        bgRelative: {
          x: e.touches[0].pageX - pos.x,
          y: e.touches[0].pageY - pos.y,
        },
      });
      document.addEventListener("touchmove", this.onMouseMove);
      document.addEventListener("touchend", this.onMouseUp);
    }
  }

  onMouseUp(e) {
    if (this.state.dragging) {
      this.setState({ dragging: false });
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
      document.removeEventListener("touchmove", this.onMouseMove);
      document.removeEventListener("touchend", this.onMouseUp);
      // e.stopPropagation();
      // e.preventDefault();
      this.state.socket.emit("moveBG", {
        userId: this.context.user.id,
        pos: this.state.bgPosition,
      });
    }
  }

  onMouseMove(e) {
    if (!this.state.dragging) return;

    const stage = document.getElementById("deck-container");
    const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
    let newX =
      e.type === "mousemove"
        ? e.pageX - this.state.bgRelative.x
        : e.touches[0].pageX - this.state.bgRelative.x;
    let newY =
      e.type === "mousemove"
        ? e.pageY - this.state.bgRelative.y
        : e.touches[0].pageY - this.state.bgRelative.y;

    if (
      (stage.getBoundingClientRect().top >=
        stage.getBoundingClientRect().height / 6 / scale &&
        newY > this.state.bgPosition.y) ||
      (stage.getBoundingClientRect().bottom <=
        stage.getBoundingClientRect().height / 2 / scale &&
        newY < this.state.bgPosition.y)
    ) {
      newY = this.state.bgPosition.y;
    }
    if (
      (stage.getBoundingClientRect().right <=
        stage.getBoundingClientRect().width / 2 &&
        stage.getBoundingClientRect().left <=
          stage.getBoundingClientRect().width &&
        newX < this.state.bgPosition.x) ||
      (stage.getBoundingClientRect().left >= 250 &&
        stage.getBoundingClientRect().right >=
          stage.getBoundingClientRect().width - 250 &&
        newX > this.state.bgPosition.x)
    ) {
      newX = this.state.bgPosition.x;
    }

    this.setState({
      bgPosition: {
        x: newX,
        y: newY,
      },
    });
    document.getElementById("deck-container").style.left = newX + "px";
    document.getElementById("deck-container").style.top = newY + "px";
  }

  syncBG(bgPosition) {
    this.setState({
      bgPosition: {
        x: bgPosition.x,
        y: bgPosition.y,
      },
    });
    const deckContainer = document.getElementById("deck-container");
    if (deckContainer) {
      deckContainer.style.left = bgPosition.x + "px";
      deckContainer.style.top = bgPosition.y + "px";
    }
  }

  cardMoved(e) {
    this.undoActions({
      card: e.detail.element,
      position: e.detail.startPosition,
      action: "moveCard",
    });
  }

  cardPlaced(e) {
    this.state.socket.emit("cardPlaced", {
      userId: this.context.user.id,
      card: e.detail,
    });
  }

  cardFlipped(e) {
    if (this.state.socket) {
      this.state.socket.emit("cardFlipped", {
        userId: this.context.user.id,
        card: e.detail,
      });
    }
  }

  cardZoomed(e) {
    if (this.state.socket) {
      this.state.socket.emit("cardZoomed", {
        userId: this.context.user.id,
        card: e.detail.element,
        zoom: e.detail.zoom,
      });
    }
  }

  syncDecks(decks) {
    const $this = this;
    decks.forEach(function (deck) {
      $this.renderDeck(deck);
    });

    this.state.activeDecks.forEach(function (activeDeck) {
      const syncDeck = decks.find((x) => x.id == activeDeck.id);
      if (syncDeck) {
        activeDeck.cards.forEach(function (activeCard) {
          const syncCard = syncDeck.cards.find((x) => x.id == activeCard.id);
          if (syncCard) {
            activeCard.animateTo({
              delay: 2,
              duration: 500,
              ease: "quartOut",
              x: syncCard.x,
              y: syncCard.y,
            });
            activeCard.hold(syncCard.holding);
            activeCard.setSide(syncCard.side);
          }
        });
      }
    });
  }

  syncCard(card) {
    this.state.activeDecks.forEach(function (activeDeck) {
      activeDeck.cards.forEach(function (activeCard) {
        if (activeCard.id === card.element.id) {
          activeCard.animateTo({
            delay: 2,
            duration: 500,
            ease: "quartOut",
            x: card.element.x,
            y: card.element.y,
          });
        }
      });
    });
  }

  syncShuffle(deckId) {
    this.state.activeDecks.forEach(function (activeDeck) {
      if (activeDeck.id === deckId) {
        activeDeck.shuffle();
      }
    });
  }

  syncSpread(deckId) {
    this.state.activeDecks.forEach(function (activeDeck) {
      if (activeDeck.id === deckId) {
        activeDeck.bysuit();
      }
    });
  }

  syncFlipCard(card) {
    this.state.activeDecks.forEach(function (activeDeck) {
      activeDeck.cards.forEach(function (activeCard) {
        if (activeCard.id === card.element.id) {
          activeCard.flipper(card.element.side);
        }
      });
    });
  }

  syncZoomCard(data) {
    console.log(data);
    this.state.activeDecks.forEach(function (activeDeck) {
      activeDeck.cards.forEach(function (activeCard) {
        if (activeCard.id === data.card.id) {
          activeCard.syncZoom(data.zoom);
        }
      });
    });
  }

  undoActions(action) {
    const actions = this.state.undoActions;
    if (actions.length > 2) actions.shift();
    this.setState({ undoable: true });
    actions.push(action);
  }

  undo() {
    const $this = this;
    const deckContainer = document.getElementById("deck-container");
    const actions = this.state.undoActions;
    if (actions.length) {
      const action = actions[actions.length - 1];
      actions.splice(actions.indexOf(action), 1);
      if (!actions.length) {
        this.setState({ undoable: false });
      }
      this.setState({ undoActions: actions });

      switch (action.action) {
        case "moveCard":
          action.card.animateTo({
            delay: 2,
            duration: 200,
            ease: "quartOut",
            x: action.position.x,
            y: action.position.y,
          });
          const actionClone = { ...action.card };
          actionClone.x = action.position.x;
          actionClone.y = action.position.y;
          this.cardPlaced({ detail: { element: actionClone } });
          break;
        case "addDeck":
          this.removeDeck(action.deck);
          break;
        case "removeDeck":
          this.reAddDeck(action.deck);
          break;
        case "hold":
          this.holdCard(action.card, action.holding, true);
          break;
        case "flipDeck":
          action.cards.forEach(function (card) {
            card.card.setSide(card.side);
          });
          break;
        case "shuffle":
          action.cards.forEach(function (card, i) {
            card.card.animateTo({
              delay: i * 2,
              duration: 500,
              ease: "quartOut",
              x: card.x,
              y: card.y,
            });
            card.card.setSide(card.side);
            const actionClone = { ...card.card };
            actionClone.x = card.x;
            actionClone.y = card.y;
            $this.cardPlaced({ detail: { element: actionClone } });
          });
          break;
        case "spread":
          action.cards.forEach(function (card, i) {
            card.card.animateTo({
              delay: i * 2,
              duration: 500,
              ease: "quartOut",
              x: card.x,
              y: card.y,
            });
            card.card.setSide(card.side);
            const actionClone = { ...card.card };
            actionClone.x = card.x;
            actionClone.y = card.y;
            $this.cardPlaced({ detail: { element: actionClone } });
          });
          break;
      }
    } else {
      this.setState({ undoable: false });
    }
  }

  renderDeckSelectors() {
    const { t } = this.props;
    const decks = this.state.allDecks;
    if (decks.length > 0) {
      const renderedDecks = decks
        .filter(
          (deck) =>
            deck.name
              .toLowerCase()
              .includes(this.state.deckFilter.toLowerCase()) ||
            (deck.keywords &&
              deck.keywords
                .toLowerCase()
                .includes(this.state.deckFilter.toLowerCase()))
        )
        .map(function (deck) {
          return this.renderDeckSelector(deck);
        }, this);
  
      return renderedDecks;
    } else {
      return <div className="noDecks">{t("gameplay.trial_over")}</div>;
    }
  }

  renderDeckSelector(deck) {
    return (
      <DeckSelector
        key={deck._id}
        deck={deck}
        activeDecks={this.state.activeDecks}
        addDeck={this.addDeck.bind(this)}
        removeDeck={this.removeDeck.bind(this)}
      />
    );
  }

  async addDeck(deck) {
    const { t } = this.props;
    const $this = this;
    const activeDecks = this.state.activeDecks;
    let showHint = false;

    try {
      if (activeDecks.find((x) => x.id === deck._id)) {
        throw Error("Already on the field");
      }

      if (
        deck.played !== true &&
        !this.props.tutorialIsOpen &&
        this.context.user.tutorial > 0
      ) {
        deck.played = true;
        showHint = true;
        const response = await fetch(
          process.env.REACT_APP_DOMAIN +
            ":" +
            process.env.REACT_APP_NODE_PORT +
            "/userDeckPlayed",
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": this.context.user.token,
            },
            body: JSON.stringify({ deckId: deck._id }),
          }
        );
        if (!response.ok) {
          throw Error(response.statusText);
        }
      }

      const updatedDecks = this.context.user.decks;
      updatedDecks.push(deck);
      this.context.methods.setDecks(updatedDecks);
      this.renderDeck(deck);
      this.state.socket.emit("renderedDeck", {
        userId: this.context.user.id,
        deck: deck,
      });

      if (
        showHint &&
        (!Cookies.get("hintedDecks") ||
          !Cookies.get("hintedDecks").includes(deck._id))
      ) {
        this.showDeckHint(deck._id);
      }

      if (deck.name.includes("See Far")) {
        this.state.deckFilter = "See";
      }

      activeDecks.forEach(function (activeDeck) {
        if (activeDeck.id === deck._id) {
          $this.undoActions({
            deck: activeDeck,
            action: "addDeck",
          });
        }
      });
      this.resetBG();
    } catch (err) {
      console.log(err);
      toast.error(t("errors.gameplay.deck_already_played"));
    }
  }

  resetBG() {
    this.syncBG({ x: 0, y: 100 });
    this.state.socket.emit("moveBG", {
      userId: this.context.user.id,
      pos: { x: 0, y: 100 },
    });
  }

  showDeckHint(deckId) {
    const { t } = this.props;
    this.setState({
      showDeckHint: true,
      deckHintSteps: [
        {
          selector: '.deck[data-id="' + deckId + '"] .step_2',
          content: t("tutorial.step_2"),
        },
      ],
    });

    const hintedDecks = Cookies.get("hintedDecks") || "";
    if (!hintedDecks || !hintedDecks.includes(deckId))
      Cookies.set("hintedDecks", hintedDecks + "," + deckId, { expires: 365 });
  }

  hideDeckHint() {
    this.setState({ showDeckHint: false, deckHintSteps: [] });
  }

  renderDeck(deck) {
    const $this = this;
    const deckContainer = document.getElementById("deck-container");
    deck.cards.forEach(function (card) {
      $this.state.allDecks.forEach(function (allDeck) {
        const userCard = allDeck.cards.find(
          (y) => y._id?.toString() === card._id?.toString()
        );
        if (userCard) card.form = userCard?.form;
      });
    });
    const newdeck = Deck(deck);
    if (this.state.activeDecks.find((x) => x.id == newdeck.id)) return false;
    const activeDecks = this.state.activeDecks;
    activeDecks.push(newdeck);
    this.setState({ activeDecks: activeDecks });
    newdeck.mount(deckContainer);
    this.addDeckButtons(newdeck);
    this.addBackgrounds(deck.backgrounds);
    newdeck.cards.forEach(function (card) {
      card.enableDragging();
      card.enableFlipping();
      $this.addCardButtons(card);
    });
  }

  addBackgrounds(backgrounds) {
    const target = document.getElementById("backgrounds");
    const $this = this;
    backgrounds.forEach(function (bg, i) {
      if (bg.combo_id) {
        if (!$this.state.activeDecks.find((x) => x.id == bg.combo_id))
          return false;
      }
      const background = document.createElement("img");
      background.setAttribute("src", bg.image);
      background.setAttribute("data-id", bg._id);

      if (!target.childNodes.length) {
        background.setAttribute("class", "active");
      }
      if (target.childElementCount >= 1) {
        $this.showBackgroundButtons();
      }
      target.appendChild(background);
    });
  }

  showBackgroundButtons() {
    const { t } = this.props;
    const buttons = document.getElementById("background-buttons");
    if (buttons) {
      buttons.innerHTML = "";
      const prevbg = document.createElement("button");
      prevbg.className = "bgbutton prevbg";
      prevbg.setAttribute("title", t("gameplay.arrow_prev"));
      prevbg.addEventListener("click", this.prevBG);
      buttons.appendChild(prevbg);

      const nextbg = document.createElement("button");
      nextbg.className = "bgbutton nextbg";
      nextbg.setAttribute("title", t("gameplay.arrow_next"));
      nextbg.addEventListener("click", this.nextBG);
      buttons.appendChild(nextbg);
    }
  }

  hideBackgroundButtons() {
    const buttons = document.getElementById("background-buttons");
    const target = document.getElementById("backgrounds");
    if (target && buttons && target.childElementCount <= 1) {
      buttons.innerHTML = "";
      if (
        !target.getElementsByClassName("active").length &&
        target.firstChild
      ) {
        target.firstChild.className = "active";
      }
    }
  }

  removeBackgrounds(backgrounds) {
    const target = document.getElementById("backgrounds");
    const buttons = document.getElementById("background-buttons");
    backgrounds.forEach(function (bg) {
      const targetbg = target.querySelectorAll('[data-id="' + bg._id + '"]');
      if (targetbg) {
        targetbg.forEach(function (bginstance) {
          bginstance.remove();
          if (bginstance.className == "active" && target.firstChild) {
            target.firstChild.className = "active";
          }
        });
      } else {
        target.innerHTML = "";
      }
      if (target.childElementCount <= 1) {
        buttons.innerHTML = "";
      }
    });
  }

  prevBG() {
    const backgrounds = document.getElementById("backgrounds");
    let active = backgrounds.getElementsByClassName("active")[0];

    if (!active) {
      backgrounds.firstChild.className = "active";
      active = backgrounds.firstChild;
    }
    let prev = active.previousSibling;
    if (!prev) {
      prev = backgrounds.lastChild;
    }
    active.className = "";
    prev.setAttribute("class", "active");
    this.state.socket.emit("activateBG", {
      userId: this.context.user.id,
      background: prev.getAttribute("src"),
    });
  }

  nextBG() {
    const backgrounds = document.getElementById("backgrounds");
    let active = backgrounds.getElementsByClassName("active")[0];

    if (!active) {
      backgrounds.firstChild.className = "active";
      active = backgrounds.firstChild;
    }
    let next = active.nextSibling;
    if (!next) {
      next = backgrounds.firstChild;
    }
    active.className = "";
    next.setAttribute("class", "active");
    this.state.socket.emit("activateBG", {
      userId: this.context.user.id,
      background: next.getAttribute("src"),
    });
  }

  activateBG(bg) {
    const backgrounds = document.getElementById("backgrounds");
    const active = backgrounds.getElementsByClassName("active")[0];
    if (active) {
      active.className = "";
    }
    const newActive = backgrounds.querySelector('[src="' + bg + '"]');
    newActive.setAttribute("class", "active");
  }

  addDeckButtons(deck) {
    const { t } = this.props;

    const deckButtons = document.createElement("div");
    deckButtons.className = "deck-buttons";
    deck.$el.appendChild(deckButtons);

    const shuffle = document.createElement("button");
    shuffle.className = "shuffle";
    shuffle.setAttribute("title", t("gameplay.shuffle"));
    shuffle.addEventListener("click", () => this.shuffleDeck(deck));
    deckButtons.appendChild(shuffle);

    const explode = document.createElement("button");
    explode.className = "explode";
    explode.setAttribute("title", t("gameplay.spread"));
    explode.addEventListener("click", () => this.spreadDeck(deck));
    deckButtons.appendChild(explode);

    const flip = document.createElement("button");
    flip.className = "flip";
    flip.setAttribute("title", t("gameplay.flip"));
    flip.addEventListener("click", () => this.flipDeck(deck));
    deckButtons.appendChild(flip);

    const info = document.createElement("button");
    info.className = "info step_2";
    info.setAttribute("title", t("gameplay.info"));
    info.addEventListener("click", () => this.showDeckInfo(deck));
    deckButtons.appendChild(info);

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.setAttribute("title", t("gameplay.remove"));
    remove.addEventListener("click", () => {
      this.setState({
        confirmOpen: true,
        confirmTitle: t("gameplay.remove_confirm"),
        onConfirm: () => this.removeDeck(deck),
      });
    });
    deckButtons.appendChild(remove);
  }

  shuffleDeck(deck) {
    const rememberCards = [];
    deck.cards.forEach(function (card) {
      rememberCards.push({ card: card, x: card.x, y: card.y, side: card.side });
    });

    this.undoActions({
      cards: rememberCards,
      action: "shuffle",
    });

    deck.shuffle();
    this.state.socket.emit("syncShuffle", {
      userId: this.context.user.id,
      deckId: deck.id,
    });
  }

  spreadDeck(deck) {
    const rememberCards = [];

    this.state.activeDecks.forEach(function (activeDeck) {
      activeDeck.cards.forEach(function (card) {
        rememberCards.push({
          card: card,
          x: card.x,
          y: card.y,
          side: card.side,
        });
      });
      if (activeDeck.id !== deck.id) {
        activeDeck.shuffle();
      }
    });
    deck.cards.forEach(function (card) {
      rememberCards.push({ card: card, x: card.x, y: card.y, side: card.side });
    });

    this.undoActions({
      cards: rememberCards,
      action: "spread",
    });

    deck.bysuit();
    this.state.socket.emit("syncSpread", {
      userId: this.context.user.id,
      deckId: deck.id,
    });
  }

  flipDeck(deck) {
    const rememberCards = [];
    deck.cards.forEach(function (card) {
      rememberCards.push({ card: card, side: card.side });
    });

    this.undoActions({
      cards: rememberCards,
      action: "flipDeck",
    });

    deck.flip();
  }

  handleFormChange(card, form) {
    card.form = form;
    this.state.socket.emit("updateForm", {
      userId: this.context.user.id,
      cardId: card.id,
      form,
    });
  }

  async saveForm(card, form) {
    this.session();
  }

  syncForm(cardId, form) {
    this.state.activeDecks.forEach((deck) => {
      const card = deck.cards.find((card) => card.id === cardId);
      if (card && card.form !== form && this.state.froalaControls) {
        card.form = form;
        this.state.froalaControls.getEditor().html.set(form);
      }
    });
  }

  toggleCardForms(card) {
    this.cardForms(card.id);
    this.state.socket.emit("cardForms", {
      userId: this.context.user.id,
      cardId: card.id,
    });
  }

  handleFroalaEditor(froalaControls) {
    this.setState({ froalaControls });
  }

  cardForms(cardId) {
    const { t } = this.props;
    const stage = document.getElementById("deck-container").parentNode;
    const formwrapper = document.createElement("div");
    const form = document.createElement("div");
    formwrapper.className = "card_form_wrapper";
    form.className = "card_form";
    formwrapper.appendChild(form);
    var card;
    this.state.activeDecks.forEach((deck) => {
      const foundCard = deck.cards.find((card) => card.id === cardId);
      if (foundCard) card = foundCard;
    });
    if (stage.getElementsByClassName("card_form_wrapper").length <= 0) {
      
      ReactDOM.render(
        <FroalaEditorComponent
          config={{
            apiKey: process.env.REACT_APP_FROALA_KEY,
            key: process.env.REACT_APP_FROALA_KEY,
            attribution: false,
            toolbarButtons: [
              ["bold", "italic"],
              ["alignLeft", "alignCenter", "alignRight"],
              ["insertImage", "insertTable"],
            ],
          }}
          model={card.form}
          onModelChange={(form) => this.handleFormChange(card, form)}
          onManualControllerReady={this.handleFroalaEditor}
        />,
        form
      );
      if (this.state.froalaControls) this.state.froalaControls.initialize();

      const closeButton = document.createElement("div");
      closeButton.className = "closeForm";
      closeButton.addEventListener("click", () => this.toggleCardForms(card));
      form.appendChild(closeButton);
      const formButtons = document.createElement("div");

      const printButton = document.createElement("button");
      printButton.className = "printForm";
      printButton.innerHTML = t("gameplay.print");
      printButton.addEventListener("click", () => this.printHTML(card.form));
      formButtons.appendChild(printButton);

      if (!this.context.user.guest) {
        const saveButton = document.createElement("button");
        saveButton.className = "saveForm";
        saveButton.innerHTML = t("gameplay.session_save");
        saveButton.addEventListener("click", () =>
          this.saveForm(card, card.form)
        );
        formButtons.appendChild(saveButton);
      } else {
        printButton.style.width = "100%";
      }
      form.appendChild(formButtons);

      stage.appendChild(formwrapper);
    } else {
      stage.querySelectorAll(".card_form_wrapper").forEach((e) => e.remove());
    }
  }

  addCardButtons(card) {
    const { t } = this.props;
    const cardButtons = document.createElement("div");
    cardButtons.className = "card-buttons";
    card.$el.getElementsByClassName("card_wrapper")[0].appendChild(cardButtons);

    const hold = document.createElement("button");
    hold.className = "hold";
    hold.setAttribute("title", t("gameplay.hold"));
    hold.addEventListener("click", () =>
      card.$el.classList.contains("holding")
        ? this.holdCard(card, false, false)
        : this.holdCard(card, true, false)
    );
    cardButtons.appendChild(hold);

    const deck =
      this.state.allDecks.find((x) => x._id === card.deck_id) ||
      this.state.activeDecks.find((x) => x.id === card.deck_id);

    if (deck?.forms?.length > 0) {
      const form = document.createElement("button");
      form.className = "form";
      form.setAttribute("title", t("gameplay.form"));
      form.addEventListener("click", () => this.toggleCardForms(card));
      cardButtons.appendChild(form);
    }
  }

  syncHold(card) {
    this.state.activeDecks.forEach(function (activeDeck) {
      activeDeck.cards.forEach(function (activeCard) {
        if (activeCard.id === card.id) {
          activeCard.hold(card.holding);
        }
      });
    });
  }

  holdCard(card, holding, undoing) {
    if (holding) {
      card.hold(true);
      if (!undoing) {
        this.undoActions({
          card: card,
          holding: false,
          action: "hold",
        });
      }
    } else {
      card.hold(false);
      if (!undoing) {
        this.undoActions({
          card: card,
          holding: true,
          action: "hold",
        });
      }
    }
    this.state.socket.emit("holding", {
      userId: this.context.user.id,
      card: card,
    });
  }

  showDeckInfo(deck) {
    const { t } = this.props;

    if (
      typeof deck["description_" + getLanguage()] !== "undefined" &&
      deck["description_" + getLanguage()]
    ) {
      this.showModal(deck["description_" + getLanguage()]);
    } else {
      this.showModal(t("gameplay.no_description"));
    }
    if (this.context.user.tutorial === 2) {
      this.props.tutorialNextStep();
      this.props.hideTutorial();
    }
    if (this.state.showDeckHint) {
      this.hideDeckHint();
    }
  }

  suggestImprovement() {
    const { t } = this.props;

    const suggestion = document.createElement("div");
    const header = document.createElement("h1");
    header.innerHTML = t("gameplay.suggest_improvement");
    const subtext = document.createElement("p");
    subtext.classList.add("suggest_subtext");
    subtext.innerHTML = t("gameplay.suggestions_text");
    const input = document.createElement("textarea");
    const button = document.createElement("button");
    button.innerHTML = t("gameplay.submit");
    button.addEventListener("click", () => {
      this.sendSuggestion(input.value);
      this.closeModal();
    });
    suggestion.appendChild(header);
    suggestion.appendChild(subtext);
    suggestion.appendChild(input);
    suggestion.appendChild(button);
    this.showModal(suggestion);
  }

  async sendSuggestion(value) {
    const { t } = this.props;
    try {
      const bodyData = {
        value: value,
      };
      const response = await fetch(
        process.env.REACT_APP_DOMAIN +
          ":" +
          process.env.REACT_APP_NODE_PORT +
          "/suggestion",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": this.context.user.token,
          },
          body: JSON.stringify(bodyData),
        }
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }

      toast.success(t("notifications.sent_admin"));
    } catch (err) {
      console.log(err);
    }
  }

  showModal(content) {
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal_content");
    const modalClose = document.getElementById("modal_close");
    const modalCloseButton = document.getElementById("dupeCloseButton");
    modal.className = "active";

    modalClose.addEventListener("click", () => this.closeModal());
    modalCloseButton.addEventListener("click", () => this.closeModal());

    modalContent.innerHTML = "";
    if (typeof content === "string") {
      modalContent.innerHTML = content;
    } else {
      modalContent.appendChild(content);
    }

    return modal;
  }

  closeModal() {
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal_content");
    modal.className = "";
    modalContent.innerHTML = "";
    if (this.context.user.tutorial === 3) {
      this.props.showTutorial();
    }
  }

  showDraggableModal(content) {
    Cookies.remove("close_info");
    const { t } = this.props;
    const modal = document.getElementById("modal_draggable");
    const modalWindow = document.getElementById("modal_draggable_window");
    const modalContent = document.getElementById("modal_draggable_content");
    const modalClose = document.getElementById("modal_draggable_close");
    const modalButtons = modal.querySelector(".modal_bottom_buttons");
    const modalCloseButton = document.getElementById(
      "draggableDupeCloseButton"
    );
    modal.className = "active";

    modal.addEventListener("mousedown", this.mousedownDraggableModal);
    modalClose.addEventListener("click", this.closeDraggableModal);
    modalCloseButton.addEventListener("click", () =>
      this.closeDraggableModal()
    );

    modalContent.innerHTML = "";
    if (typeof content === "string") {
      modalContent.innerHTML = content;
    } else {
      modalContent.appendChild(content);
    }

    if (!document.getElementById("restart_tutorial_button")) {
      const restartTutorialButton = document.createElement("button");
      restartTutorialButton.id = "restart_tutorial_button";
      restartTutorialButton.innerHTML = t("gameplay.restart_tutorial");
      restartTutorialButton.classList.add("restart_tutorial_button");
      restartTutorialButton.addEventListener("click", this.restartTutorial);
      modalButtons.appendChild(restartTutorialButton);
    }
  }

  closeDraggableModal() {
    Cookies.set("close_info", true, { expires: 365 });
    const modal = document.getElementById("modal_draggable");
    const modalContent = document.getElementById("modal_draggable_content");
    modal.className = "";
    modalContent.innerHTML = "";
    modal.style.removeProperty("top");
    modal.style.removeProperty("left");
    const restartTutorialButton = modal.querySelector(
      ".restart_tutorial_button"
    );
    if (restartTutorialButton) restartTutorialButton.remove();
    if (this.context.user.tutorial === 0) {
      this.props.showTutorial();
    }
  }

  restartTutorial() {
    this.closeDraggableModal();
    this.props.tutorialUpdateStep(0);
    this.props.showTutorial();
  }

  mousedownDraggableModal(e) {
    if (
      e.which !== 3 &&
      e.button !== 2 &&
      e.which === 1 &&
      !(e.ctrlKey || e.metaKey) &&
      e.type !== "touchstart"
    )
      return false;
    this.setState({
      draggingModal: true,
      draggableModalPosition: { x: e.clientX, y: e.clientY },
    });
    document.addEventListener("mousemove", this.mousemoveDraggableModal);
    document.addEventListener("mouseup", this.mouseupDraggableModal);
  }

  mousemoveDraggableModal(e) {
    if (this.state.draggingModal === true && e.type === "mousemove") {
      const modal = document.getElementById("modal_draggable");
      const y = this.state.draggableModalPosition.y - e.clientY;
      const x = this.state.draggableModalPosition.x - e.clientX;
      modal.style.top = modal.offsetTop - y + "px";
      modal.style.left = modal.offsetLeft - x + "px";
      this.setState({ draggableModalPosition: { x: e.clientX, y: e.clientY } });
      e.stopPropagation();
      e.preventDefault();
    }
  }

  mouseupDraggableModal() {
    this.setState({ draggingModal: false });
    document.removeEventListener("mouseup", this.mouseupDraggableModal);
    document.removeEventListener("mousemove", this.mousemoveDraggableModal);
  }

  

  shop() {
    this.setState({ shop: true });
  }

  closeShopWindow() {
    this.setState({ shop: false });
  }

  closeShopWindowO () {
    this.setState({ shop: true });
  }

  account() {
    this.setState({ account: true });
  }

  closeAccountWindow() {
    this.setState({ account: false });
  }

  

  async session() {
    const { t } = this.props;
    const $this = this;

    const response = await fetch(
      process.env.REACT_APP_DOMAIN +
        ":" +
        process.env.REACT_APP_NODE_PORT +
        "/getSessions",
      {
        headers: {
          "x-access-token": this.context.user.token,
        },
      }
    );
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const sessions = await response.json();
    let groupedSessions = [];
    if (sessions.length) {
      //group the sessions by clientName
      groupedSessions = sessions.reduce(function (rv, x) {
        let v = x["clientName"];
        let el = rv.find((r) => r && r.key === v);
        if (el) {
          el.values.push(x);
        } else {
          rv.push({ key: v, values: [x] });
        }
        return rv;
      }, []);
    }



    const session = document.createElement("div");
    const header = document.createElement("h1");
    header.innerHTML = t("gameplay.manage_session");
    const subtext = document.createElement("p");
    subtext.className = "sessions_subtext";
    subtext.innerHTML = t("gameplay.sessions_subtext");
    const newSession = document.createElement("div");
    newSession.className = "session_option";

    const newbutton = document.createElement("button");
    newbutton.innerHTML = t("gameplay.start_new_session");
    newbutton.className = "new_session";
    newbutton.addEventListener("click", () => {
      this.setState({
        confirmOpen: true,
        confirmTitle: t("gameplay.start_new_session_confirm"),
        onConfirm: () => {
          this.newSession();
          this.closeModal();
        },
      });
    });
    newSession.appendChild(newbutton);

    const invitebutton = document.createElement("button");
    invitebutton.innerHTML = t("gameplay.invite");
    invitebutton.className = "invite_session";
    invitebutton.addEventListener("click", () => {
      this.closeModal();
      this.invite();
    });
    newSession.appendChild(invitebutton);

    const saveheader = document.createElement("h2");
    saveheader.innerHTML = t("gameplay.session_save");
    newSession.appendChild(saveheader);

    const savelabelclient = document.createElement("label");

   



    ReactDOM.render(
      <Autocomplete
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={t("gameplay.session_default_client_name")}
            inputRef={this.refClientName}
          />
        )}
        options={groupedSessions}
        freeSolo
        getOptionLabel={(option) => option.key}
      />,
      savelabelclient
    );
    const savespanclient = document.createElement("span");
    savespanclient.innerHTML = t("gameplay.session_client_name");

    savelabelclient.appendChild(savespanclient);

    const savelabel = document.createElement("label");
    const savespan = document.createElement("span");
    savespan.innerHTML = t("gameplay.session_name");
    const saveinput = document.createElement("input");
    saveinput.setAttribute("placeholder", t("gameplay.session_name"));
    saveinput.setAttribute(
      "value",
      this.context.user.session
        ? this.context.user.session.name
        : t("gameplay.session_default_name")
    );
    savelabel.appendChild(savespan);
    savelabel.appendChild(saveinput);

    const savebutton = document.createElement("button");
    savebutton.innerHTML = t("gameplay.session_button_save");
    savebutton.addEventListener("click", () => {
      this.saveSession(this.refClientName.current.value, saveinput.value);
      this.closeModal();
    });
    newSession.appendChild(savelabelclient);
    newSession.appendChild(savelabel);
    newSession.appendChild(savebutton);

    const loadSession = document.createElement("div");
    loadSession.className = "session_option";

    const loadheader = document.createElement("h2");
    loadheader.innerHTML = t("gameplay.session_load");
    loadSession.appendChild(loadheader);

    if (sessions.length) {
      const loadlabelclient = document.createElement("label");
      const loadspanclient = document.createElement("span");
      loadspanclient.innerHTML = t("gameplay.session_default_client_name");
      const loadlabelsession = document.createElement("label");
      ReactDOM.render(
        <Autocomplete
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("gameplay.session_default_client_name")}
              inputRef={this.refClientNameLoad}
            />
          )}
          options={groupedSessions}
          getOptionLabel={(option) => option.key}
          onChange={(event, value) => {
            ReactDOM.unmountComponentAtNode(loadlabelsession);
            if (value) {
              ReactDOM.render(
                <Select
                  onChange={() => {}}
                  placeholder="Session"
                  defaultValue={value.values[0]?._id}
                  className="selectSession"
                >
                  {value.values.map(function (session) {
                    return (
                      <MenuItem
                        key={session._id}
                        value={session._id}
                        onClick={() => {
                          $this.setState({
                            confirmOpen: true,
                            confirmTitle: t("gameplay.session_load_confirm"),
                            onConfirm: () => {
                              $this.loadSession(session._id);
                              $this.closeModal();
                            },
                          });
                        }}
                      >
                        {session.name}
                      </MenuItem>
                    );
                  })}
                </Select>,
                loadlabelsession
              );
            }
          }}
        />,
        loadlabelclient
      );
      loadlabelclient.appendChild(loadspanclient);
      loadSession.appendChild(loadlabelclient);
      loadSession.appendChild(loadlabelsession);
    } else {
      const emptySessions = document.createElement("h2");
      emptySessions.innerHTML = t("gameplay.no_sessions");
      loadSession.appendChild(emptySessions);
    }

    const sessionOptions = document.createElement("div");
    sessionOptions.className = "session_options";

    sessionOptions.appendChild(newSession);
    sessionOptions.appendChild(loadSession);

    session.appendChild(header);
    session.appendChild(subtext);
    session.appendChild(sessionOptions);

    const modal = this.showModal(session);
    modal.classList.add("sessions_modal");
  }

  async newSession() {
    const { t } = this.props;

    const $this = this;
    const activeDecks = [...this.state.activeDecks];
    activeDecks.forEach(function (deck) {
      $this.removeDeck(deck);
    });
    this.setState({ undoable: false, undoActions: [] });
    this.state.socket.emit("logoutGuests", { userId: this.context.user.id });
    try {
      const response = await fetch(
        process.env.REACT_APP_DOMAIN +
          ":" +
          process.env.REACT_APP_NODE_PORT +
          "/startNewSession",
        {
          headers: {
            "x-access-token": this.context.user.token,
          },
        }
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      this.context.methods.setInviteCode(json.inviteCode);
    } catch (err) {
      console.log(err);
      toast.error(err);
    }
    toast.success(t("notifications.new_session_started"));
  }

  async saveSession(clientName, name) {
    const { t } = this.props;
    if (name.length > 0) {
      try {
        const bodyData = {
          clientName:
            typeof clientName !== "undefined" && clientName.length
              ? clientName
              : t("gameplay.session_default_client_name"),
          name: name,
          decks: this.state.activeDecks,
        };
        const response = await fetch(
          process.env.REACT_APP_DOMAIN +
            ":" +
            process.env.REACT_APP_NODE_PORT +
            "/sessionSave",
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": this.context.user.token,
            },
            body: JSON.stringify(bodyData),
          }
        );
        if (!response.ok) {
          throw Error(response.statusText);
        }
        const json = await response.json();

        this.context.methods.setSession(json);
        toast.success(t("notifications.session_saved"));
      } catch (err) {
        console.log(err);
        toast.error(t("errors.gameplay.session_not_saved"));
      }
    } else {
      toast.error(t("errors.gameplay.session_name_empty"));
    }
  }

  async loadSession(id) {
    const { t } = this.props;
    const $this = this;

    if (id.length > 0) {
      try {
        const activeDecks = [...this.state.activeDecks];
        activeDecks.forEach(function (deck) {
          $this.removeDeck(deck);
        });
        $this.setState({ undoable: false, undoActions: [] });

        const bodyData = {
          id: id,
        };
        const response = await fetch(
          process.env.REACT_APP_DOMAIN +
            ":" +
            process.env.REACT_APP_NODE_PORT +
            "/sessionLoad",
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": this.context.user.token,
            },
            body: JSON.stringify(bodyData),
          }
        );
        if (!response.ok) {
          throw Error(response.statusText);
        }
        const json = await response.json();

        this.context.methods.setSession(json);

        if (json.decks.length > 0) {
          json.decks.forEach(function (deck) {
            $this.renderDeck(deck);
          });
        }
        toast.success(t("notifications.session_loaded"));
      } catch (err) {
        console.log(err);
        toast.error(t("errors.gameplay.session_not_loaded"));
      }
    } else {
      toast.error(t("errors.gameplay.session_name_empty"));
    }
  }

  print() {
    const target = document.querySelector("#deck-container");
    const width = 2560;
    const height = 1440;

    //html2canvas has a onClone function that supposedly lets you change the element before capturing it but it most definitely doesn't work. Instead I have to change the actual element and then revert it
    const prevLeft = target.style.left;
    const prevTop = target.style.top;
    const prevMargin = target.style.margin || "auto auto auto 60%";
    const prevTransform = target.style.transform || "translateX(-50%)";

    target.style.left = "0";
    target.style.top = "0";
    target.style.margin = "auto";
    target.style.transform = "none";
    target.style.webkitTransform = "none";

    html2canvas(target, {
      width: width,
      height: height,
      windowWidth: width,
      windowHeight: height,
      x: target.style.left,
      y: target.style.top,
      scrollX: target.style.left,
      scrollY: target.style.top,
    }).then((canvas) => {
      const nWindow = window.open("");
      nWindow.document.body.appendChild(canvas);
      nWindow.focus();
      nWindow.print();
      setTimeout(function () {
        nWindow.close();
      }, 100);
    });

    target.style.left = prevLeft;
    target.style.top = prevTop;
    target.style.margin = prevMargin;
    target.style.transform = prevTransform;
    target.style.webkitTransform = prevTransform;
  }

  printHTML(html) {
    const dump = document.createElement("div");
    dump.innerHTML = html;
    document.getElementById("root").appendChild(dump);

    const width = 385;
    const height = dump.offsetHeight;

    html2canvas(dump, {
      width: width,
      height: height,
      windowWidth: width,
      windowHeight: height,
    }).then((canvas) => {
      const nWindow = window.open("");
      nWindow.document.body.appendChild(canvas);
      nWindow.focus();
      nWindow.print();
      setTimeout(function () {
        nWindow.close();
        dump.remove();
      }, 100);
    });
  }

  printScreenshot() {
    html2canvas(document.querySelector("#deck-container")).then((canvas) => {
      return canvas2image.saveAsJPEG(canvas);
    });
  }

  async multipleAllowed() {
    await fetch(
      process.env.REACT_APP_DOMAIN +
        ":" +
        process.env.REACT_APP_NODE_PORT +
        "/multipleAllowed",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": this.context.user.token,
        },
        body: JSON.stringify({
          multipleAllowed: !this.context.user.multipleAllowed,
        }),
      }
    );
    this.context.methods.setMultipleAllowed(!this.context.user.multipleAllowed);
  }

  invite() {
    const { t } = this.props;
    const invite = document.createElement("div");
    const header = document.createElement("h1");
    header.innerHTML = t("gameplay.invite_session");
    const multipleAllowedLabel = document.createElement("label");
    const multipleAllowed = document.createElement("input");
    multipleAllowed.checked = this.context.user.multipleAllowed;
    multipleAllowed.type = "checkbox";
    multipleAllowed.addEventListener("change", () => this.multipleAllowed());
    multipleAllowedLabel.innerHTML = t("gameplay.allow_multiple_guests");
    multipleAllowedLabel.className = "allowMultipleGuests";
    multipleAllowedLabel.appendChild(multipleAllowed);

    const link = document.createElement("div");
    const inviteCode = this.context.user.inviteCode
      ? this.context.user.inviteCode
      : this.context.user.id;
    const url = process.env.REACT_APP_DOMAIN + "/join/" + inviteCode;
    link.innerHTML =
      t("gameplay.share_invite_link") + " <a href=" + url + ">" + url + "</a>";
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof navigator.clipboard !== "undefined") {
        navigator.clipboard.writeText(url).then(function () {
          toast.success(t("notifications.copied_clipboard"));
        });
      } else {
        window.prompt("Copy to clipboard: Ctrl+C, Enter", url);
      }
    });
    const input = document.createElement("input");
    input.setAttribute("type", "email");
    input.setAttribute("placeholder", t("gameplay.invite_session_send_email"));
    const button = document.createElement("button");
    button.innerHTML = t("gameplay.invite_session_button");
    button.addEventListener("click", () => {
      this.sendInvitation(input.value);
      this.closeModal();
    });
    invite.appendChild(header);
    invite.appendChild(multipleAllowedLabel);
    invite.appendChild(link);
    invite.appendChild(input);
    invite.appendChild(button);
    this.showModal(invite);
  }

  async sendInvitation(email) {
    const { t } = this.props;

    if (!email.length) {
      toast.error(t("errors.gameplay.invalid_email"));
    }
    try {
      const bodyData = {
        email: email,
      };
      const response = await fetch(
        process.env.REACT_APP_DOMAIN +
          ":" +
          process.env.REACT_APP_NODE_PORT +
          "/invite",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": this.context.user.token,
          },
          body: JSON.stringify(bodyData),
        }
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }
      toast.success(t("notifications.invitation_sent"));
    } catch (err) {
      console.log(err);
      toast.error(t("errors.gameplay.invitation_not_sent"));
    }
  }

  async reAddDeck(deck) {
    this.renderDeck(deck);
    const updatedDecks = this.context.user.decks;
    const activeDecks = this.state.activeDecks;
    if (activeDecks.findIndex((x) => x.id == deck.id) < 0) {
      activeDecks.push(deck);
    }
    updatedDecks.push(deck);

    this.context.methods.setDecks(updatedDecks);

    this.setState({
      activeDecks: activeDecks,
    });
    this.state.socket.emit("renderedDeck", {
      userId: this.context.user.id,
      deck: deck,
    });
  }

  async removeDeck(deck) {
    const { t } = this.props;
    const activeDecks = this.state.activeDecks;
    const activeDecksPrint = [...this.state.activeDecks];
    let index = activeDecksPrint.findIndex((x) => x.id == deck.id);

    if (index < 0) return false;

    let deck2remove = deck;
    activeDecksPrint.forEach(function (activeDeck, i) {
      if (activeDeck.id === deck.id) {
        index = i;
        deck2remove = activeDeck;
      }
    });

    if (index > -1) {
      activeDecks.splice(index, 1);
    }

    this.setState({ activeDecks: activeDecks });
    this.removeBackgrounds(deck2remove.backgrounds);
    deck2remove.unmount();
    this.resetBG();

    const deckPanel = document.getElementById("deck-selectors_wrapper");

    if (deckPanel) {
      if (
        !this.props.tutorialIsOpen &&
        !this.state.showDeckHint &&
        !this.state.activeDecks.length &&
        deckPanel.classList.contains("minimized")
      ) {
        this.setState({
          showDeckHint: true,
          deckHintSteps: [
            { selector: ".step_0", content: t("tutorial.step_0") },
          ],
        });
      }
    }

    try {
      this.state.socket.emit("removedDeck", {
        userId: this.context.user.id,
        deck: deck,
      });
      this.undoActions({
        deck: deck,
        action: "removeDeck",
      });
    } catch (err) {
      console.log(err);
      toast.error(t("errors.gameplay.delete_deck"));
    }
  }

  explodeDeck(deck) {
    deck.cards.forEach(function (card, i) {
      card.setSide("front");

      // explode
      card.animateTo({
        delay: i * 2,
        duration: 500,
        ease: "quartOut",

        x: Math.random() * window.innerWidth - window.innerWidth / 2,
        y: Math.random() * window.innerHeight - window.innerHeight / 2,
      });
    });
  }

  cleanBoard() {
    const activeDecksPrint = [...this.state.activeDecks];
    activeDecksPrint.forEach(function (activeDeck) {
      this.removeBackgrounds(activeDeck.backgrounds);
      activeDeck.unmount();
      activeDeck.shuffle();
    }, this);
    this.setState({ activeDecks: [] });
  }

  navigationButtons() {
    const { t } = this.props;
    if (this.context.user.guest) {
      return (
        <div id="navigation">
          <button
            type="button"
            title="Ctrl+Z"
            disabled={!this.state.undoable}
            id="undo"
          >
            {t("gameplay.undo")}
          </button>
        </div>
      );
    } else {
      return (
        <div id="navigation" className="step_5">
          <button
            type="button"
            style={{ border: "0px solid red" }}
            id="account_button"
            onClick={this.shop}
          >
            {t("gameplay.purchase")}
          </button>
          <button type="button" id="session" onClick={this.session}>
            {t("gameplay.session")}
          </button>
          <button type="button" id="invite" onClick={this.invite}>
            {t("gameplay.invite")}
          </button>
          <button type="button" id="print" onClick={this.print}>
            {t("gameplay.print")}
          </button>
          <button type="button" id="suggest" onClick={this.suggestImprovement}>
            {t("gameplay.suggest")}
          </button>
          <button type="button" id="help" onClick={this.interfaceInfo}>
            {t("gameplay.help")}
          </button>
          <button
            type="button"
            title="Ctrl+Z"
            disabled={!this.state.undoable}
            id="undo"
          >
            {t("gameplay.undo")}
          </button>
        </div>
      );
    }
  }

  scroll(e) {
    if (e.deltaY < 0) {
      this.zoomPlus();
    } else if (e.deltaY > 0) {
      this.zoomMinus();
    }
  }

  zoomMinus() {
    if (this.state.showDrawbox) return;
    const deckContainer = document.getElementById("deck-container");
    const scaleX =
      deckContainer.getBoundingClientRect().width / deckContainer.offsetWidth;
    const newscale = Math.max(scaleX - 0.1, 0.3);
    deckContainer.style.transform =
      "scale(" + newscale + ") translateX(-50%) translateY(10%)";
    deckContainer.style.webkitTransform =
      "scale(" + newscale + ") translateX(-50%) translateY(10%)";
  }

  zoomPlus() {
    if (this.state.showDrawbox) return;
    const deckContainer = document.getElementById("deck-container");
    const scaleX =
      deckContainer.getBoundingClientRect().width / deckContainer.offsetWidth;
    const newscale = scaleX + 0.1;
    deckContainer.style.transform =
      "scale(" + newscale + ") translateX(-50%) translateY(10%)";
    deckContainer.style.webkitTransform =
      "scale(" + newscale + ") translateX(-50%) translateY(10%)";
  }

  zoomReset() {
    const deckContainer = document.getElementById("deck-container");
    deckContainer.style.transform = "translateX(-50%) translateY(10%)";
    deckContainer.style.webkitTransform = "translateX(-50%) translateY(10%)";
  }

  toggleFullscreen() {
    const doc = window.document;
    const docEl = doc.documentElement;
    const requestFullScreen =
      docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;
    const cancelFullScreen =
      doc.exitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen ||
      doc.msExitFullscreen;

    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      requestFullScreen.call(docEl);
    } else {
      cancelFullScreen.call(doc);
    }
  }

  async interfaceInfo() {
    try {
      const response = await fetch(
        process.env.REACT_APP_DOMAIN +
          ":" +
          process.env.REACT_APP_NODE_PORT +
          "/getInterfaceInfo?lang=" +
          getLanguage(),
        {
          headers: {
            "x-access-token": this.context.user.token,
          },
        }
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      this.showDraggableModal(json.value);
    } catch (err) {
      console.log(err);
      toast.error(err);
    }
  }

  async showDeckStarter() {
    this.setState({ deckStarter: true });
  }

  async closeDeckStarter() {
    const { t } = this.props;
    this.setState({ deckStarter: false });
    const deckPanel = document.getElementById("deck-selectors_wrapper");

    if (
      !this.props.tutorialIsOpen &&
      this.context.user.tutorial > 0 &&
      !this.state.showDeckHint &&
      !this.state.activeDecks.length &&
      deckPanel.classList.contains("minimized")
    ) {
      this.setState({
        showDeckHint: true,
        deckHintSteps: [{ selector: ".step_0", content: t("tutorial.step_0") }],
      });
    }
  }

  toggleDeckSelectors(e) {
    const tutorialStep = this.context.user.tutorial;
    if (tutorialStep === 0 && this.props.tutorialIsOpen) {
      this.props.tutorialNextStep();
    } else {
      e.target.parentNode.parentNode.classList.toggle("minimized");
    }

    if (this.state.showDeckHint) {
      this.hideDeckHint();
    }
  }

  filterDecksList(element) {
    this.setState({ deckFilter: element.target.value });
  }

  logOut() {
    const { t } = this.props;
    toast(t("notifications.logged_out"));
    Cookies.remove("token");
    this.state.socket.emit("logout", { userId: this.context.user.id });
    this.context.methods.resetUser();
    this.state.socket.close();
  }

  backgroundsUpdate(bgs) {
    this.state.socket.emit("syncBackgrounds", {
      userId: this.context.user.id,
      backgrounds: bgs,
    });
  }

  render() {
    const { t } = this.props;
    const cardboardClasslist = this.state.hideDecksAndMenu
      ? "cardboard minimal"
      : "cardboard";
    return (
      <div className={cardboardClasslist}>
        <ConfirmPrompt
          open={this.state.confirmOpen}
          title={this.state.confirmTitle}
          onClose={() => this.setState({ confirmOpen: false })}
          onConfirm={this.state.onConfirm}
        />
        {this.state.hideDecksAndMenu && (
          <div
            className="unminify"
            onClick={() => this.setState({ hideDecksAndMenu: false })}
          >
            {t("gameplay.unhide")}
          </div>
        )}
        <div className="gameHeader">
          {this.navigationButtons()}
          <div id="manipulation" className="step_3">
            {!this.context.user.guest && (
              <button
                type="button"
                onClick={this.account}
                id="account_open"
                title={t("gameplay.account")}
              >
                {t("gameplay.hi") + this.context.user.username}
              </button>
            )}
            <button
              type="button"
              onClick={this.zoomMinus}
              title={t("gameplay.zoom_out")}
              id="zoom-minus"
            />
            <button
              type="button"
              onClick={this.zoomPlus}
              title={t("gameplay.zoom_in")}
              id="zoom-plus"
            />
            <button
              type="button"
              onClick={this.toggleFullscreen}
              title={t("gameplay.fullscreen")}
              id="zoom-reset"
            />
            <button
              type="button"
              onClick={() => this.setState({ hideDecksAndMenu: true })}
              title={t("gameplay.hide_decks_and_menu")}
              id="hide-decks_and_menu"
            />
            {!this.context.user.guest && (
              <button
                type="button"
                onClick={this.logOut}
                id="logout"
                title={t("gameplay.logout")}
              />
            )}
          </div>
          <Lang />
        </div>
        {!this.context.user.guest && (
          <div id="deck-selectors_wrapper" className="step_1">
            <div id="deck-selectors">
              <div id="searchDecks">
                <input
                  type="text"
                  name="searchDecks"
                  value={this.state.deckFilter}
                  onChange={this.filterDecksList}
                  placeholder={t("gameplay.search_decks")}
                />
              </div>
              <div
                className="mobile_minimize step_0"
                onClick={this.toggleDeckSelectors}
                title={t("gameplay.toggle_deck_selector")}
              />
              {this.renderDeckSelectors()}
              <Tour
                isOpen={this.state.showDeckHint}
                steps={this.state.deckHintSteps}
                showNavigation={false}
                showNumber={false}
                maskSpace={2}
                showButtons={false}
                disableFocusLock={true}
                onRequestClose={this.hideDeckHint}
                highlightedMaskClassName="deckHint"
              />
              <button
                type="button"
                id="cleanboard"
                onClick={() =>
                  this.setState({
                    confirmOpen: true,
                    confirmTitle: t("gameplay.remove_confirm"),
                    onConfirm: () => {
                      this.cleanBoard();
                    },
                  })
                }
              >
                {t("gameplay.clean_board")}
              </button>
            </div>
          </div>
        )}
        <div
          className="deck-wrapper"
          id="deck-container"
          style={{ top: "calc(50% + 100px)" }}
        >
          <div id="backgrounds">
            {this.state.showDrawbox ? <div id="painterro" style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }} /> : this.context.user.backgrounds.map(function (background, i) {
              return (
                <img
                  src={background}
                  alt="background"
                  className={
                    this.context.user.backgrounds.length === i + 1 &&
                    (!this.state.activeDecks.length ||
                      !this.state.activeDecks.find((x) => x.backgrounds.length))
                      ? "active"
                      : ""
                  }
                />
              );
            }, this)}
          </div>
        </div>
        <div id="bottom_right" className="step_4">
          <div
            className="addBackgroundsButton"
            onClick={this.account}
            title={t("gameplay.upload_backgrounds")}
          />
          <div id="background-buttons">
            {this.context.user.backgrounds.length > 1 ||
            this.state.activeDecks.length > 1 ||
            this.state.activeDecks.length +
              this.context.user.backgrounds.length >
              1
              ? this.showBackgroundButtons()
              : this.hideBackgroundButtons()}
          </div>
        </div>
        <div>
          {!this.context.user.guest && (
            <Shop
              windowState={this.state.shop}
              socket={this.state.socket}
              closeShopWindow={this.closeShopWindow.bind(this)}
              showModal={this.showModal.bind(this)}
            />
          )}
          <Account
            windowState={this.state.account}
            socket={this.state.socket}
            openShop={this.shop.bind(this)}
            closeAccountWindow={this.closeAccountWindow.bind(this)}
            syncBackgrounds={this.backgroundsUpdate}
            activateBG={(src) => {
              this.activateBG(src);
              this.state.socket.emit("activateBG", {
                userId: this.context.user.id,
                background: src,
              });
            }}
          />
          {!this.context.user.guest && (
            <>
              <DeckStarter
                windowState={this.state.deckStarter}
                openShop={this.shop.bind(this)}
                addDeck={this.addDeck.bind(this)}
                closeWindow={this.closeDeckStarter.bind(this)}
              />
              <TrialEndedMessage />
            </>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation(Gameplay);

const List = require('../models/listModel.js')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()


const apiConfig = {
    url: 'https://api.igdb.com/v4/games/',
    method: 'post',
    headers: {
      Authorization: process.env.IGDB_TOKEN,
      'Client-ID': process.env.IGDB_CLIENT_ID,
      'Content-Type': 'text/plain',
    },
}

exports.getAllLists = async (req, res, next) => {
  try {
    // Récupérer les paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //Récuperer les filtres
    const query = req.query.q;
    const ranked = req.query.ranked;
    const sort = req.query.sort;
    const order = req.query.order;

    // Construire le filtre pour la requête MongoDB

    //Filtre par nom, description
    const filter = {};
    if (query) {
      filter["$or"] = [        { name: { $regex: query, $options: "i" } },        { description: { $regex: query, $options: "i" } },    { "tags.tag": { $regex: query, $options: "i" } },    ];
    }
    
    //Filtre par ranked ou pas
    if (ranked != undefined) {
      filter["ranked"] = ranked;
    }

    // Ajouter le tri à la requête MongoDB
    const sortQuery = {};
    if (sort) 
    {
      sortQuery[sort] = order === 'asc' ? 1 : -1; //Tri par nom et updatedAt
    }

    // Récupérer toutes les listes sous forme d'objets JS simples avec pagination
    const lists = await List.find(filter).skip(skip).limit(limit).sort(sortQuery).collation({locale:"en", caseLevel:true}).lean();

    // Obtenir le nombre total de listes qui correspondent au filtre
    const totalLists = await List.countDocuments(filter);

    

    // Si le nombre total de listes est égal à 0, renvoyer une réponse vide
    if (totalLists === 0) {
      return res.status(200).json({ lists: [], totalLists: 0 });
    }

    // Limiter chaque liste à 6 jeux maximum
    lists.forEach((list) => {
      list.gamesLength = list.games.length;
      list.games = list.games.slice(0, 6);
    });



    // Récupérer les ids des jeux
    const games = lists.flatMap((list) => list.games);
    const ids = games.map((game) => game.id_IGDB);


    //Si les listes possèdent des jeux
    if(ids.length!==0){

      const idString = ids.join(",");
      const data = `fields name, slug, cover.image_id; where id=(${idString}); limit:300;`;
      const config = { ...apiConfig, data };
  
      // Récupérer les jeux correspondants aux id
      const response = await axios(config);
      const igdbGames = response.data;
  
      // Mettre à jour les jeux dans chaque liste
      lists.forEach((list) => {
        list.games = list.games.map((listGame) => { 
          const igdbGame = igdbGames.find((game) => game.id.toString().trim() === listGame.id_IGDB.toString().trim());
          return igdbGame ? { ...listGame, ...igdbGame } : listGame;
        });
      });
    }



    // Renvoyer la réponse avec les données et le nombre total de listes
    res.status(200).json({ lists, totalLists });
  } catch (error) {
    res.status(400).json({ error });
  }
};



exports.getAllListsWithGame = async (req, res, next) => {
  try {
    
    // Récupérer l'ID du jeu
    const gameId = Number(req.params.gameId);
    // Créer un objet de projection qui inclut les attributs nécessaires
    const projection = {
      name: 1,
      _id: 1,
      public:1,
      ranked:1,
      games: {
        $filter: {
          input: "$games",
          as: "game",
          cond: { $eq: ["$$game.id_IGDB", gameId] }
        }
      }
    };
    // Récupérer toutes les listes avec le nom, l'ID et l'annotation du jeu correspondant, mais sans les autres jeux
    const lists = await List.aggregate([{ $project: projection }]);

    res.status(200).json({ lists });
  } catch (error) {
    res.status(400).json({ error });
  }
};




exports.getAllListsFromuser = (req,res,next)=>{
    List.find({idOwner:req.params.idOwner})
    .then(listS=> res.status(200).json(listS))
    .catch(error => res.status(400).json({error}))
}   

exports.getListById = async (req,res,next) =>{
  function compareByRank(a, b) {
    return a.rank - b.rank;
  }
  try {

    const list = await List.findOne({_id:req.params.id}).lean()
    
    // Incrémenter l'attribut "views"
    list.views = (list.views || 0) + 1;

    // Récupérer les ids des jeux
    const ids = list.games.map((game) => game.id_IGDB);

    //Si la liste possèdent des jeux
    if(ids.length!==0){
      const idString = ids.join(",");
      const data = `fields name, slug, cover.image_id, first_release_date, aggregated_rating, aggregated_rating_count,rating, rating_count; where id=(${idString}); limit:300;`;
      const config = { ...apiConfig, data };
      // Récupérer les jeux correspondants aux id
      const response = await axios(config);
      const igdbGames = response.data;
      // Mettre à jour les jeux dans la liste
        list.games = list.games.map((listGame) => { 
          const igdbGame = igdbGames.find((game) => game.id.toString().trim() === listGame.id_IGDB.toString().trim());
          return igdbGame ? { ...listGame, ...igdbGame } : listGame;
        });
    }
    if(list.ranked && list.games && list.games.length>1) list.games.sort(compareByRank);

    
    // Enregistrer la mise à jour dans la base de données
    await List.findOneAndUpdate({ _id: req.params.id }, list);

    res.status(200).json(list)

     
  }
  catch (error){
    res.status(400).json({ error });

  }
    
}

exports.createList = (req,res,next)=>{
    const listData = req.body;
    
    // If the list is ranked and games don't have rank, add an iterative rank
    if (listData.ranked && listData.games && listData.games.length > 0) {
      let lastRank = 0;
      const gamesWithRank = listData.games.filter((game) => game.rank);
      if (gamesWithRank.length > 0) {
        lastRank = Math.max(...gamesWithRank.map((game) => game.rank));
      }
      for (let i = 0; i < listData.games.length; i++) {
        if (!listData.games[i].rank) {
          lastRank++;
          listData.games[i].rank = lastRank;
        }
      }
    }
  
    const list = new List(listData);

    list.save()
        .then((result)=>
        res.status(201).json({
          message:'List created with success !',
          listCreated : result //Renvoyer la liste créée
      }))
        .catch(error => res.status(400).json({error}))
}

exports.deleteListById = (req,res,next)=>{
    List.deleteOne({_id:req.params.id})
        .then(()=>res.status(200).json({message:'List deleted with success !'}))
        .catch(error => res.status(400).json({error}))
}


exports.addGameToList = async (req, res, next) => {
  const listIds = req.query.ids.split(',');
  const annotations = req.body.annotations || {}; // On récupère les annotations envoyées dans le body


  try {
    const lists = await List.find({ _id: { $in: listIds } }); 

    if (!lists || lists.length === 0) {
      return res.status(404).json({ error: "Lists not found" });
    }

    const gameToAdd = { id_IGDB: req.body.id_IGDB.toString().trim() };

    // Add game to lists that don't already contain it
    const promises = lists.map(list => {
      const gameAlreadyInList = list.games.some(game => game.id_IGDB.toString().trim() === gameToAdd.id_IGDB.toString().trim());
      if (!gameAlreadyInList) {
        // Check if list is ranked and game has no rank
        if (list.ranked && !req.body.rank) {
          const lastRank = list.games.length > 0 ? list.games[list.games.length - 1].rank : 0;
          gameToAdd.rank = lastRank + 1;
        } else {
          gameToAdd.rank = req.body.rank;
        }
        if (annotations[list._id]) { // Si une annotation a été fournie pour cette liste, on l'ajoute
          gameToAdd.annotation = annotations[list._id];
        }
        list.games.push(gameToAdd);
        list.lastUpdate = new Date()
        return list.save();
      }
    });
    await Promise.all(promises);
    return res.status(200).json({ message: "Game added to lists with success" });
  } catch (error) {
    return res.status(400).json({ error });
  }
};




//Remove game from ONE LIST

  exports.removeGameFromList = async (req, res, next) => {
    const listId = req.params.id;
    const gameId = req.params.id_IGDB;
    try {
      const list = await List.findById(listId);
  
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }
  
      // Find index of game to remove
      const gameIndex = list.games.findIndex((game) => game.id_IGDB == gameId);
  
      if (gameIndex === -1) {
        return res.status(404).json({ error: "Game not found in list" });
      }
  
      // Remove game from list
      list.games.splice(gameIndex, 1);

      // Update ranks of remaining games if the list is ranked
        if (list.ranked) {
            for (let i = gameIndex; i < list.games.length; i++) {
                list.games[i].rank--;
            }
        }
        

      list.lastUpdate = new Date()
      await list.save();
  
      return res.status(200).json({ message: "Game removed from list with success" });

    } catch (error) {
      return res.status(400).json({ error });
    }
  };


  exports.updateList = async (req, res, next) => {
    try {
      // Update the list with the new data
      const updatedList = await List.findByIdAndUpdate(req.params.id, req.body, { new: true });
  
      // Set the lastUpdate attribute to the current date and time
      updatedList.lastUpdate = new Date();
  
      // Save the updated list to the database
      await updatedList.save();
  
      // Send the updated list as a response to the client
      res.status(200).json(updatedList);
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  

  //Remove Game from MANY List
exports.removeGameFromLists = async (req, res, next) => {
  const gameId = parseInt(req.params.id_IGDB);
  console.log(gameId);

  const listIds = req.query.listIds.split(",");

  try {
    for (let i = 0; i < listIds.length; i++) {
      const listId = listIds[i];
      const list = await List.findById(listId);
  
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }
  
      // Find index of game to remove
      const gameIndex = list.games.findIndex((game) => game.id_IGDB == gameId);
  
      if (gameIndex === -1) {
        return res.status(404).json({ error: "Game not found in list" });
      }
  
      // Remove game from list
      list.games.splice(gameIndex, 1);

      // Update ranks of remaining games if the list is ranked
        if (list.ranked) {
            for (let i = gameIndex; i < list.games.length; i++) {
                list.games[i].rank--;
            }
        }
      list.lastUpdate = new Date()
      await list.save();
    }

    return res
      .status(200)
      .json({ message: "Game removed from selected lists with success" });
  } catch (error) {
    return res.status(400).json({ error });
  }
};



// Route pour aimer une liste
exports.likeListById = async (req, res, next) => { 
   try {
    const listId = req.params.id;
    const userId = Math.floor(Math.random() * 1000) + 1; // Générez un identifiant utilisateur aléatoire

    // Recherchez la liste avec l'ID fourni
    const list = await List.findById(listId);

    // Vérifiez si l'utilisateur a déjà aimé cette liste
    const liked = list.likes.some(like => like.idUser === userId);

    if (liked) {
      // Si l'utilisateur a déjà aimé la liste, renvoyez un message d'erreur
      res.status(400).json({ message: "Vous avez déjà aimé cette liste" });
    } else {
      // Sinon, ajoutez l'ID de l'utilisateur à la liste des likes
      list.likes.push({ idUser: userId });
      list.likesCount++;
      await list.save();
      res.status(200).json({ message: "Liste aimée avec succès" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Route pour retirer un like d'une liste
exports.unlikeListById = async (req, res, next) => {
try {
const listId = req.params.id;
// Recherchez la liste avec l'ID fourni
const list = await List.findById(listId);

// Vérifiez si la liste a au moins un like
if (list.likes.length === 0) {
  // Si la liste n'a aucun like, renvoyez un message d'erreur
  res.status(400).json({ message: "La liste n'a aucun like" });
} else {
  // Sinon, retirez le dernier like de la liste des likes
  list.likes.pop();
  list.likesCount--;
  await list.save();
  res.status(200).json({ message: "Like retiré avec succès" });
}
}
 catch (error) {
res.status(500).json({ message: error.message });
}
};
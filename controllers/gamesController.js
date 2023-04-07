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



//motaru

exports.getGameBySlug = (req,res,next)=>{
    const slug = req.params.slug;
    const data = `fields name, alternative_names.* , slug,
                  cover.image_id, videos.*,
                  summary, storyline,
                  language_supports.language.locale, language_supports.language_support_type.id,
                  involved_companies.*, involved_companies.company.name,
                  screenshots.image_id,  artworks.image_id,
                  first_release_date, 
                  version_title, 
                  category,
                  genres.slug,
                  themes.slug,
                  player_perspectives.slug,
                  game_modes.slug,
                  franchises.name, franchises.slug, franchises.games.name, franchises.games.slug, franchises.games.cover.image_id, franchises.games.category, franchises.games.version_parent,
                  collection.name, collection.slug, collection.games.name, collection.games.slug, collection.games.cover.image_id,collection.games.category, collection.games.version_parent,
                  websites.category, websites.url,
                  remasters.name, remasters.slug, remasters.cover.image_id, remasters.alternative_names.name, remasters.alternative_names.comment, remasters.category,
                  remakes.name, remakes.slug, remakes.cover.image_id, remakes.alternative_names.name, remakes.alternative_names.comment, remakes.category,
                  ports.name, ports.slug, ports.cover.image_id, ports.alternative_names.comment , ports.alternative_names.name, ports.category,
                  dlcs.name, dlcs.slug, dlcs.cover.image_id, dlcs.alternative_names.comment , dlcs.alternative_names.name, dlcs.category,
                  expansions.name, expansions.slug, expansions.cover.image_id, expansions.alternative_names.comment , expansions.alternative_names.name, expansions.category,
                  expanded_games.name, expanded_games.slug, expanded_games.cover.image_id, expanded_games.alternative_names.comment , expanded_games.alternative_names.name,  expanded_games.category,
                  standalone_expansions.name, standalone_expansions.slug, standalone_expansions.cover.image_id, standalone_expansions.alternative_names.comment , standalone_expansions.alternative_names.name, standalone_expansions.category,
                  parent_game.name, parent_game.slug, parent_game.cover.image_id, parent_game.alternative_names.comment, parent_game.alternative_names.name, parent_game.category,
                  version_parent.name, version_parent.slug,
                  release_dates.human,release_dates.date, release_dates.region, release_dates.platform.abbreviation,
                  platforms.name, platforms.abbreviation,
                  aggregated_rating, aggregated_rating_count,
                  rating, rating_count,
                  similar_games.name, similar_games.slug, similar_games.cover.image_id, similar_games.category, franchises.games.version_parent
                  ;
                  where slug="${slug}";`
    let config = { ...apiConfig, data }
    axios(config)
      .then((response) => {
        res.status(200).json(response.data)
      })
      .catch((err) => {
        res.send(err)
      })    
}

//kibda 



exports.searchAll = (req, res) => {
    const data="fields name,rating,slug,cover.url,cover.image_id;where cover.url != null & rating>80;sort rating desc;limit 100;"
    const config2 = { ...apiConfig, data}
    
    axios(config2)
    .then((response) => {
        if (response.data.length<1 ) {
        res.status(200).end('Pas de resultat.')
        
        }else{
            
            res.status(200).json(response.data);
        }
        

    })
    .catch((err) => {
        res.send(err)
    })
   
  }




    //search game by name | genres | game_modes | platforms | player_perspectives | themes 
exports.searchGame = (req, res) => {
    var message = req.params.name
    let data="fields name,slug,cover.url, cover.image_id;limit 30;"
   
    //nkawen data sentence
    //const message = 'search=mario&genres=1,2,3&game_modes=1,hmid,satour&platform=false&walid=1,2'
    var tab=message.split('&')
    tab=tab.filter(v=>!v.includes("false"))
    if(tab.length>0  ){
    if(!tab[0].includes("search")) {
        data+="where"
    }    
    }
    console.log(tab)
    tab.forEach(v=>{
    var v2=v.split("=")
    console.log(v2)
    if(v2[0]==="search"){
        data+='search "'+v2[1]+'";' 
        if(tab.length>1){
            data+="where"
        }
    }
    else{
    var v3=v2[1].split(",");
    data+="("
    v3.forEach(v4=>{
        if(v4!==v3[v3.length-1]){
            data+=v2[0]+".name"+'="'+v4+'" |'  
        }else{
            data+= v2[0]+".name"+'="'+v4+'" )'
            if(!tab[tab.length-1].includes(v2[0])){
                data+="&"  
            }
        }
    })  
    }
    })
    if(data[data.length-1]!==";"){
      data+=";" ;
    } 
    
    

    const config = { ...apiConfig, data }
    
    axios(config)
    .then((response) => {
        if (response.data.length < 1) {
        res.status(200).end('Pas de resultat.')
        
        }else{
            
            res.status(200).json(response.data);
        }
        

    })
    .catch((err) => {
        res.send(err)
    })
    
  



  }


  //new way to search for games 
  exports.searchGames= (req,res)=>{

    let data = "fields name,slug,cover.url, category, cover.image_id,rating;limit 100; where "
    const excludeCategories = "(category=(0)|category=(4)|category=(8)|category=(10)|category=(12))"
    let filterOn = false;

    if (Object.keys(req.query).length > 0) {
        const queryParams = [];
        for (const [key, value] of Object.entries(req.query)) {
            queryParams.push(key)
        }

        for (var [key, value] of Object.entries(req.query)) {
            if (key === "q") {
                value = value.trim().replace(/\s/g, "%");
                console.log("value=" + value)
                if (value !== "") {
                    data += ` ( name ~ *"${value}"*  |   alternative_names.name ~ *"${value}"* ) & `
                }
            } else {
                if (!filterOn) {
                    data += ` ${excludeCategories} &(`
                    filterOn = true;
                } else {
                    data += "(";
                }
                let allValues = value.split(",")
                allValues.forEach((v, i) => {
                    if (i > 0) {
                        data += "&";
                    }
                    data += key + "=(" + v+")";
                })
                data += ")&";
            }
        }

        if (!filterOn) {
            data += ` ${excludeCategories} &cover.url!=null&version_parent=null;`
        } else {
            data += "cover.url!=null&version_parent=null;"
        }

        console.log(data);

        //API call
        const config = { ...apiConfig, data }

        axios(config)
            .then((response) => {
                if (response.data.length < 1) {
                    res.status(200).end('Pas de resultat.')
                } else {
                    res.status(200).json(response.data);
                }
            })
            .catch((err) => {
                res.send(err)
            })
    


}else if(Object.keys(req.query).length===0){
        //without params 
         data=`fields name, category, rating,slug,cover.url,cover.image_id;where ${excludeCategories} & cover.url != null & hypes != n&version_parent=null; sort hypes desc;limit 100;`
        const config2 = { ...apiConfig, data}
    
        axios(config2)
        .then((response) => {
            if (response.data.length<1 ) {
            res.status(200).end('Pas de resultat.')
            }else{ 
                res.status(200).json(response.data);
            }
        })
        .catch((err) => {
            res.send(err)
        })

    }


  }

  exports.searchLight= (req,res)=>{
    
    const gameName = req.params.name;
    const name = gameName.trim().replace(/\s/g, "%");

    const excludeCategories = "(category=(0)|category=(4)|category=(8)|category=(10)|category=(12))"

    data=`fields name, category,   platforms.abbreviation , platforms.name, first_release_date, slug,cover.image_id; where ( name ~ *"${name}"*  |
    alternative_names.name ~ *"${name}"* ) & ${excludeCategories} & version_parent=null; limit 5;`
    const config = { ...apiConfig, data}
    
    axios(config)
    .then((response) => {
        res.status(200).json(response.data);
    })
    .catch((err) => {
        res.send(err)
    })
    console.log(name);
  }


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

const multiQueryConfig = {
    url: 'https://api.igdb.com/v4/multiquery/',
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
  //new way to search for games 
  exports.searchGames= (req,res)=>{

    let data = "fields name, slug,  platforms.name, platforms.abbreviation, release_dates.human,release_dates.date, release_dates.region, release_dates.platform.abbreviation, screenshots.image_id, first_release_date, category, cover.image_id,rating; limit 50; where "
    const excludeCategories = "(category=(0)|category=(4)|category=(8)| category=(9) | category=(10)| category=(11) | category=(12))"
    let filterOn = false;

    if (Object.keys(req.query).length > 0) {
        const queryParams = [];
        for (const [key, value] of Object.entries(req.query)) {
            queryParams.push(key)
        }

        for (var [key, value] of Object.entries(req.query)) {
            if (key === "q") {
                value = value.trim().replace(/\s/g, "%");
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
            data += ` ${excludeCategories} &version_parent=null;`
        } else {
            data += "version_parent=null;"
        }

        

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
         data=`fields name, platforms.name, platforms.abbreviation, release_dates.human,release_dates.date, release_dates.region, release_dates.platform.abbreviation,
         screenshots.image_id, first_release_date, category, rating,slug,cover.url,cover.image_id;where ${excludeCategories} &  first_release_date >=  ${ Math.floor(((new Date()).getTime() - (365 * 24 * 60 * 60 * 2000)) / 1000) }  &  cover.url != null & hypes > 25 &version_parent=null; sort first_release_date asc;limit 50;`
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


  //Search light
  exports.searchLight= (req,res)=>{
    
    const gameName = req.params.name;
    const name = gameName.trim().replace(/\s/g, "%");

    const excludeCategories = "(category=(0)|category=(4)|category=(8)| category=(9) | category=(10)| category=(11) | category=(12))"

    data=`fields name, category,   platforms.abbreviation , platforms.name, first_release_date, slug,cover.image_id; where ( name ~ *"${name}"*  |
    alternative_names.name ~ *"${name}"* ) & ${excludeCategories} & version_parent=null; limit 10;`
    const config = { ...apiConfig, data}
    
    axios(config)
    .then((response) => {
        res.status(200).json(response.data);
    })
    .catch((err) => {
        res.send(err)
    })
  }


  exports.latestGames= (req,res)=>{
    const fields = "fields name, platforms.name, genres.slug, platforms.abbreviation, release_dates.human,release_dates.date, release_dates.region, release_dates.platform.abbreviation,screenshots.image_id, first_release_date, category, rating,slug,cover.url,cover.image_id;"
    const data = `
        query games "Latest games" {
           ${fields}
            sort first_release_date desc;
            where rating >= 80 & first_release_date!=null & first_release_date <=  ${Math.floor(Date.now() / 1000)} & cover!=null;
            limit 8;
        };
        query games "Upcoming games" {
           ${fields}    
            sort first_release_date asc;
            where hypes > 10 & first_release_date!=null & first_release_date >  ${Math.floor(Date.now() / 1000)} & cover!=null;
            limit 8;
        };

    }
    ` 
    //    query games/count "count" {};`
    const config = { ...multiQueryConfig, data}
        
    axios(config)
    .then((response) => {
        res.status(200).json(response.data);
    })
    .catch((err) => {
        res.send(err)
    })

  }
  



const Repository = require('../models/Repository');
const NouvellesRepository = require('../models/nouvellesRepository');
const Nouvelle = require('../models/nouvelle');

module.exports = 
class nouvellesController extends require('./Controller') {
    constructor(req, res){
        super(req, res, false /* needAuthorization */);
        this.nouvellesRepository = new NouvellesRepository(req, this.getQueryStringParams());
    }
    queryStringParamsList(){
        let content = "<div style=font-family:arial>";
        content += "<h4>List of parameters in query strings:</h4>";
        content += "<h4>? sort=key <br> return all nouvelles sorted by key values (Id, Name, Category, Url)";
        content += "<h4>? sort=key,desc <br> return all nouvelles sorted by descending key values";        
        content += "<h4>? key=value <br> return the nouvelle with key value = value";
        content += "<h4>? key=value* <br> return the nouvelle with key value that start with value";
        content += "<h4>? key=*value* <br> return the nouvelle with key value that contains value";        
        content += "<h4>? key=*value <br> return the nouvelle with key value end with value";
        content += "<h4>page?limit=int&offset=int <br> return limit nouvelles of page offset";
        content += "</div>";
        return content;
    }
    queryStringHelp() {
        // expose all the possible query strings
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(this.queryStringParamsList());
    }
  
    resolveUserName(nouvelle){
        let users = new Repository('Users');
        let user = users.get(nouvelle.UserId);
        let username = "unknown";
        if (user !== null)
            username = user.Name;
        let nouvelleWithUsername = {...nouvelle};
        nouvelleWithUsername["Username"] = username;
        return nouvelleWithUsername;
    }

    resolveUserNames(nouvelles){
        let users = new Repository('Users');
        let nouvellesWithUsername = nouvelles.map(nouvelle => ({...nouvelle}));
        for(let nouvelle of nouvellesWithUsername) {
            let user = users.get(nouvelle.UserId);
            let username = "unknown";
            if (user !== null)
                username = user.Name;
            nouvelle["Username"] = username;
        };
        return nouvellesWithUsername;
    }

    head() {
        console.log(this.nouvellesRepository.ETag);
        this.response.JSON(null, this.nouvellesRepository.ETag);
    }
    // GET: api/nouvelles
    // GET: api/nouvelles?sort=key&key=value....
    // GET: api/nouvelles/{id}
    get(id){
        // if we have no parameter, expose the list of possible query strings
        if (this.params === null) {
            if(!isNaN(id)) {
                this.response.JSON(this.resolveUserName(this.nouvellesRepository.get(id)));
            }
            else  
                this.response.JSON( this.resolveUserNames(this.nouvellesRepository.getAll()), 
                                    this.nouvellesRepository.ETag);
        }
        else {
            if (Object.keys(this.params).length === 0) {
                this.queryStringHelp();
            } else {
                this.response.JSON( this.resolveUserNames(this.nouvellesRepository.getAll()), 
                                    this.nouvellesRepository.ETag);
            }
        }
    }
    // POST: api/nouvelles body payload[{"Id": ..., "Name": "...", "Url": "...", "Category": "...", "UserId": ...}]
    post(nouvelle){  
        if (this.requestActionAuthorized()) {
            // validate nouvelle before insertion
            if (nouvelle.valid(nouvelle)) {
                // avoid duplicate names
                if (this.nouvellesRepository.findByField('Name', nouvelle.Name) !== null){
                    this.response.conflict();
                } else {
                    let newnouvelle = this.nouvellesRepository.add(nouvelle);
                    if (newnouvelle)
                        this.response.created(newnouvelle);
                    else
                        this.response.internalError();
                }
            } else 
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }
    // PUT: api/nouvelles body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "...", "UserId": ..}]
    put(nouvelle){
        if (this.requestActionAuthorized()) {
            // validate nouvelle before updating
            if (nouvelle.valid(nouvelle)) {
                let foundnouvelle = this.nouvellesRepository.findByField('Name', nouvelle.Name);
                if (foundnouvelle != null){
                    if (foundnouvelle.Id != nouvelle.Id) {
                        this.response.conflict();
                        return;
                    }
                }
                if (this.nouvellesRepository.update(nouvelle))
                    this.response.ok();
                else 
                    this.response.notFound();
            } else 
                this.response.unprocessable();
        } else 
        this.response.unAuthorized();
    }
    // DELETE: api/nouvelles/{id}
    remove(id){
        if (this.requestActionAuthorized()) {
            if (this.nouvellesRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
            } else 
        this.response.unAuthorized();
    }
}
const Repository = require('./Repository');
const ImageFilesRepository = require('./ImageFilesRepository.js');
const Nouvelle = require('./nouvelle.js');
const utilities = require("../utilities");
module.exports = 
class nouvellesRepository extends Repository {
    constructor(req, params){
        super('nouvelles', true);
        this.users = new Repository('Users');
        this.req = req;
        this.params = params;
    }
    bindUsernameAndnouvelleURL(nouvelle){
        if (nouvelle) {
            let user = this.users.get(nouvelle.UserId);
            let username = "unknown";
            let userAvatarURL = "";
            if (user !== null) {
                username = user.Name;
                if (user.AvatarGUID != "")
                    userAvatarURL = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
            } 
            let bindednouvelle = {...nouvelle};
            bindednouvelle["Username"] = username;
            bindednouvelle["UserAvatarURL"] = userAvatarURL;

            if (nouvelle["GUID"] != ""){
                bindednouvelle["OriginalURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(nouvelle["GUID"]);
                bindednouvelle["ThumbnailURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getThumbnailFileURL(nouvelle["GUID"]);
            } else {
                bindednouvelle["OriginalURL"] = "";
                bindednouvelle["ThumbnailURL"] = "";
            }
            return bindednouvelle;
        }
        return null;
    }
    bindUseramesAndnouvelleURLS(nouvelles){
        let bindednouvelles = [];
        for(let nouvelle of nouvelles) {
            bindednouvelles.push(this.bindUsernameAndnouvelleURL(nouvelle));
        };
        return bindednouvelles;
    }
    get(id) {
        return this.bindUsernameAndnouvelleURL(super.get(id));
    }
    getAll() {
        return this.bindUseramesAndnouvelleURLS(super.getAll());
    }
    add(nouvelle) {
        nouvelle["Created"] = utilities.nowInSeconds();
        if (Nouvelle.valid(nouvelle)) {
            nouvelle["GUID"] = ImageFilesRepository.storeImageData("", nouvelle["nouvelleData"]);
            delete nouvelle["nouvelleData"];
            return super.add(nouvelle);
        }
        return null;
    }
    update(nouvelle) {
        nouvelle["Created"] = utilities.nowInSeconds();
        if (Nouvelle.valid(nouvelle)) {
            let foundnouvelle = super.get(nouvelle.Id);
            if (foundnouvelle != null) {
                nouvelle["GUID"] = ImageFilesRepository.storeImageData(nouvelle["GUID"], nouvelle["nouvelleData"]);
                delete nouvelle["nouvelleData"];
                return super.update(nouvelle);
            }
        }
        return false;
    }
    remove(id){
        let foundnouvelle = super.get(id);
        if (foundnouvelle) {
            ImageFilesRepository.removeImageFile(foundnouvelle["GUID"]);
            return super.remove(id);
        }
        return false;
    }
}
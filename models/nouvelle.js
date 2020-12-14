module.exports = 
class Nouvelle{
    constructor(title, description, username, avatar, GUID)
    {
        this.Id = 0;
        this.Title = title !== undefined ? title : "";
        this.Description = description !== undefined ? description : "";
        this.username = username !== undefined ? username : 0;
        this.Avatar = avatar !== undefined ? avatar : "";
        this.GUID = GUID !== undefined ? GUID : "";
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('Title','string');
        validator.addField('Description','string');
        validator.addField('username', 'string');
        return validator.test(instance);
    }
}
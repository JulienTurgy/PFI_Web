module.exports = 
class Nouvelle{
    constructor(title, description, username, created, avatar, GUID)
    {
        this.Id = 0;
        this.Title = title !== undefined ? title : "";
        this.Description = description !== undefined ? description : "";
        this.Username = username !== undefined ? username : 0;
        this.Created = created !== undefined ? created : 0;
        this.Avatar = avatar !== undefined ? avatar : "";
        this.GUID = GUID !== undefined ? GUID : "";
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('Title','string');
        validator.addField('Description','string');
        validator.addField('Username', 'string');
        validator.addField('Created','integer');
        return validator.test(instance);
    }
}
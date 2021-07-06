const Religion = require("../../model/Religion");
const ResourceController = require("./ResourceController");
const {v4: uuidv4 } = require('uuid');

class ReligionController extends ResourceController{
    constructor(){
        super(Religion);
    }

    // Admin section
    async create(religionData){
        let newReligion = new Religion(uuidv4(), religionData.name);
        try{
            let result = await newReligion.save();
            if(result){
                return newReligion.toObject();
            } else {
                throw new Error('Gagal membuat agama baru');
            }
        } catch(e){
            throw e;
        }
    }

    async update(relId, updatedRelData){
        try{
            let relModel = new Religion();
            let religion = await relModel.findById(relId);
            if(religion === null) throw new Error('Agama tidak ditemukan');
            
            try{
                let resultUpdate = await religion.update(updatedRelData);
                if(resultUpdate === null) throw new Error('Agama gagal diperbarui');
                
                return resultUpdate.toObject();
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async delete(relId){
        try{
            let relModel = new Religion();
            let religion = await relModel.findById(relId);
            if(religion === null) throw new Error('Agama tidak ditemukan');
            try{
                let resultDelete = await religion.delete();
                return resultDelete;
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }
}

module.exports = ReligionController;
const Degree = require("../../model/Degree");
const ResourceController = require("./ResourceController");
const {v4: uuidv4 } = require('uuid');

class DegreeController extends ResourceController{
    constructor(){
        super(Degree);
    }

    // Admin section
    async create(degreeData){
        let newDegree = new Degree(uuidv4(), degreeData.name);
        try{
            let result = await newDegree.save();
            if(result){
                return newDegree.toObject();
            } else {
                throw new Error('Gagal membuat gelar baru');
            }
        } catch(e){
            throw e;
        }
    }

    async update(degId, updatedDegData){
        try{
            let degModel = new Degree();
            let degree = await degModel.findById(degId);
            if(degree === null) throw new Error('Gelar tidak ditemukan');

            try{
                let resultUpdate = await degree.update(updatedDegData);
                if(resultUpdate === null) throw new Error('Gelar gagal diperbarui');

                return resultUpdate.toObject();
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async delete(degId){
        try{
            let degModel = new Degree();
            let degree = await degModel.findById(degId);
            if(degree === null) throw new Error('Gelar tidak ditemukan');

            try{
                let result = await degree.delete();
                return result;
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }
}

module.exports = DegreeController;
class crudRepository {
    constructor(model) {
        this.model = model;
    }

    async create (data){
        return this.model.create(data);
    }

    async getById (id) {
        return await this.model.findById(id);
    }

    async readAll (filter = {}) {
        return await this.model.find(filter);
    }

    async update(id,data) {
        return await this.model.findByIdAndUpdate(
            id,
            data,
            {
                new:true,   // It return updated content not the previous content
                runValidators: true //Run the validator also 
            }
        )
    }

    async delete (id){
        return await this.model.findByIdAndDelete(id);
    }
}

export default crudRepository;
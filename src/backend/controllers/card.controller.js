const cardService = require("../services/card.service");

module.exports= {
    getCards: async(req,res) => {
        const pageSize=10;
        let {page}=req.query;
        if(!page) page=1;
        const data=await cardService.getCards(page,pageSize);
        return res.status(201).json({
            message:"Ok",
            data:data
        })
    }
}

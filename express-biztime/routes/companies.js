/** Routes for companies **/

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");



router.get('/', async (req,res,next) =>{

    try{
        const results = await db.query('SELECT * FROM companies;')
        return res.json ({companies: results.rows})
    } catch(e){
        return next(e);
    }


})

router.get('/:code', async (req,res,next) =>{

    try{
        const{code} = req.params;
        const results = await db.query('select * from companies where code = $1', [code]);
        const invResults = await db.query('select * from invoices where comp_code = $1',[code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with a code of ${code}`, 404)
          }
          
          let invoiceObj = {invoices: invResults.rows};
          let finalResults = results.rows[0];

          
          Object.assign(finalResults, invoiceObj);
          
          return res.json({ company: finalResults })
        } catch (e) {
          return next(e)
        }
      })



router.post('/', async (req,res,next) =>{

    try{
        const{code, name, description}  = req.body;
        const results = await db.query('insert into companies (code,name,description) values ($1,$2,$3) returning code, name, description', [code, name, description]);
        return res.status(201).json({company: results.rows[0]});
    }catch(e){
        return next(e);
    }



})



router.patch('/:code', async (req,res,next) =>{

    try{
        const{code} = req.params;
        const{name, description}  = req.body;
        const results = await db.query('update companies set name= $1,description = $2 where code = $3 returning code, name, description', [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update company with code of ${code}, code does not exist`, 404)
        }
        return res.status(200).json({company: results.rows[0]});
    }catch(e){
        return next(e);
    }



})


router.delete('/:code', async (req,res,next) =>{

    try{
        const{code} = req.params;
        const resultsCheck = await db.query('select * from companies where code = $1', [code])
        if (resultsCheck.rows.length === 0) {
            throw new ExpressError(`Can't find company with a code of ${code}`, 404)
          }
                
        const results = await db.query('delete from companies where code = $1', [code]);

        return res.send({message: `Company ${code} has been deleted.`});
    }catch(e){
        return next(e);
    }



})





module.exports = router;
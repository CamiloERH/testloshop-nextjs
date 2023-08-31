import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../database';
import Product from '../../../models/Product';
import { IProduct } from '../../../interfaces';

type Data = { message: string } | IProduct[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return searchProducts(req, res);
        default:
            return res.status(400).json({
                message: 'Bad request'
            })
    }
}

const searchProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    let { q = '' } = req.query;

    if (q.length === 0) {
        return res.status(400).json({
            message: 'Debe de especificar el query de búsqueda'
        });
    }

    q = q.toString().toLowerCase();

    await db.connect();
    const products = await Product.find({ $text: { $search: q } }).select('title tags images price inStock slug -_id').lean();
    await db.disconnect();

    return res.status(200).json(products)
}
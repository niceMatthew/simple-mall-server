import { Slider, SliderDocument } from "../models"
import { Request, Response } from 'express';

export const list = async (_req: Request, res: Response) => {
    let sliders: SliderDocument[] = await Slider.find();
    res.json({ success: true, data: sliders });
}
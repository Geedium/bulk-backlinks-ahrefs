import type { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios';

import UserAgent from 'user-agents';

const Captcha = require("2captcha")

import { Solver } from '2captcha';

async function getData(url: string, captchaKey: string, proxy: string) {
    // A new 'solver' instance with our API key
    const solver: Solver = new Captcha.Solver(captchaKey);

    // Generate fake 'user-agent'
    const ua = new UserAgent();

    const answer = await solver.turnstile("0x4AAAAAAAAzi9ITzSN9xKMi", "https://ahrefs.com/backlink-checker", {
        userAgent: ua.toString(),
        ...proxy && {
            proxy,
            proxytype: 'HTTPS'
        },
    });

    const { data } = await axios.post('https://ahrefs.com/v4/stGetFreeBacklinksOverview', {
        url,
        mode: "subdomains",
        captcha: answer.data,
    }, {
        headers: {
            'User-Agent': ua.toString(),
        },
    });

    return data;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method === 'POST') {
        const json = JSON.parse(req.body);
        if (!json.url) {
            res.status(400).json({ message: "Missing url!" });
            return;
        }

        return await getData(json.url, json.captchaKey, json.proxy)
            .then((data) => {
                res.status(200).json(data);
            })
            .catch(err => {
                res.status(500).json({ message: err.message });
            });
    } else {
        res.status(409).json({ message: "INVALID METHOD!" })
    }
}

"use client";

import { useEffect, useState } from "react"

interface TableEntry {
  domainRating: string;
  urlRating: number;
  backlinks: number;
  refdomains: number;
  dofollowBacklinks: number;
  dofollowRefdomains: number;
  url: string;
}

export default function Home() {
  const [text, setText] = useState('');

  const [proxy, setProxy] = useState('');

  const [captchaKey, setCaptchaKey] = useState("");

  const [loading, setLoading] = useState(false);

  const [entries, setEntries] = useState<TableEntry[]>([]);

  useEffect(() => {
    const pull = localStorage.getItem('captchaKey') || "";
    setCaptchaKey(pull);
  }, []);

  // const extractDomain = (url: string) => {
  //   const regex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i;
  //   const match = url.match(regex);
  //   return match ? match[1] : null;
  // }

  const clearText = () => {
    if (loading) {
      return;
    }

    setText('');
  };

  const onGenerate = async () => {
    if (loading) {
      return;
    }

    const explode = text.split('\n');

    // Reset to default values
    setEntries([]);
    setLoading(true);

    for await (const item of explode) {

      let hasError = false;

      const res = await fetch('/api/solve', {
        method: "POST",
        body: JSON.stringify({
          url: item,
          captchaKey,
          proxy,
        })
      })
        .then(data => data.json())
        .catch(err => {
          hasError = true;
          console.error(err.message);
          setEntries(prevItems => [...prevItems, { url: `Failed: ${item}` } as TableEntry]);
        })

      if (hasError) {
        console.error(`${item} failed. Please try again.`);
        continue;
      }

      // Get request data by index
      const json: any = res?.[1];

      if (json) {
        // Create a new table entry from request data
        setEntries(prevItems => [...prevItems, {
          url: item,
          domainRating: json.data.domainRating,
          urlRating: json.data.urlRating,
          backlinks: json.data.backlinks,
          refdomains: json.data.refdomains,
          dofollowBacklinks: json.data.dofollowBacklinks,
          dofollowRefdomains: json.data.dofollowRefdomains,
        } as TableEntry]);
      }
    }

    setLoading(false);
  };

  const onTextUpdated = (e: any) => {
    const val = e.target?.value;
    setText(val);
  };

  return (
    <div>
      <div className="p-8 mt-6 lg:mt-0 rounded shadow bg-white w-full">
        <div>Proxy: </div>
        <input type="text" className="border border-slate-400 w-full" value={proxy} onChange={(e) => {
          const val = e.target?.value;
          setProxy(val);
        }} />
      </div>
      <div className="p-8 mt-6 lg:mt-0 rounded shadow bg-white w-full">
        <div>2Captcha API key: </div>
        <input type="text" className="border border-slate-400 w-full" value={captchaKey} onChange={(e) => {
          const val = e.target?.value;
          localStorage.setItem('captchaKey', val);
          setCaptchaKey(val);
        }} />
      </div>
      <div className="p-8 mt-6 lg:mt-0 rounded shadow bg-white">
        <button onClick={clearText} className="bg-black text-white p-2">{loading ? 'Loading...' : 'Clear'}</button>
        <textarea disabled={loading} rows={10} value={text} onChange={onTextUpdated} className="block border border-slate-600 w-full" />
        <button onClick={onGenerate} className="bg-black text-white p-2">{loading ? 'Loading...' : 'Generate DR information'}</button>
      </div>
      <div className="p-8 mt-6 lg:mt-0 rounded shadow bg-white">
        <table className="table-auto border-collapse border border-slate-500">
          <thead>
            <tr role="row">
              <th className="border border-slate-600 p-2">Domain</th>
              <th className="border border-slate-600 p-2">DR</th>
              <th className="border border-slate-600 p-2">URL Rating</th>
              <th className="border border-slate-600 p-2">Backlinks</th>
              <th className="border border-slate-600 p-2">Ref Domains</th>
              <th className="border border-slate-600 p-2">dofollowBacklinks</th>
              <th className="border border-slate-600 p-2">dofollowRefdomains</th>
            </tr>
          </thead>
          <tbody>
            {
              entries && Array.isArray(entries) && entries.length > 0 ?
                entries.map((entry, index) => {
                  return <tr key={index}>
                    <td className="border border-slate-700 p-2">{entry.url}</td>
                    <td className="border border-slate-700 p-2">{entry.domainRating}</td>
                    <td className="border border-slate-700 p-2">{entry.backlinks}</td>
                    <td className="border border-slate-700 p-2">{entry.urlRating}</td>
                    <td className="border border-slate-700 p-2">{entry.refdomains}</td>
                    <td className="border border-slate-700 p-2">{entry.dofollowBacklinks}</td>
                    <td className="border border-slate-700 p-2">{entry.dofollowRefdomains}</td>
                  </tr>
                }) : (
                  <tr>
                    <td colSpan={7} className="text-center">No domain ratings.</td>
                  </tr>
                )
            }
            <tr>

            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

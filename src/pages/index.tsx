"use client";

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { callAIWithInput } from '../scripts/ai';
import React, { useState } from 'react';

export default function Home() {

  const [file, setFile] = useState();
  const [resultJSON, setResultJSON] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [chunking, setChunking] = useState(false);

  function handleSetFile(event) {
    // validate that this is a .txt file
    if (event.target && event.target.files[0].name.endsWith(".txt")) {

      let reader = new FileReader();

      // read parts of the file
      reader.onload = function(event) {

        if (event && event.target) {
          // parse title
          let result = String(event.target?.result);
          const title = result.split("\n")[0];

          setChunking(true);
  
          callAIWithInput(String(event.target.result), title).then((result) => {
            console.log("Result in callback", result);
            let errors = result[1];
            console.log("errors", errors);
            setChunking(false);
            setResultJSON(result[0]);
          });
        }

      }

      reader.readAsText(event.target.files[0]);
  
  
    } else {
      // errorstate
    }
  }
  
  function handleSubmit(event) {
    // parse file
  
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Extract file</title>
      </Head>

      <main>

        <h1 className={styles.title}>
          Extract file contents
        </h1>
        <form method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="file">Choose txt file to upload</label>
            <input type="file" id="file" name="file" accept=".txt" onChange={(event) => handleSetFile(event)} />
          </div>
        </form>
          { chunking ? (
            <div>Processing...this could take a while due to rate limiting from chatGPT (3 calls a minute).</div>
          ) : 
          (
            <div>Errors: <br />
            {errors.length === 0 ? <span>Woohoo, no errors :)</span> : errors}
            <br /> Chunked Results: <br /><pre id="results">{resultJSON}</pre></div>
          )
        }
        
      </main>

      <footer>
      </footer>

    </div>
  );
}

"use client";

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { batchAICalls, buildResultJson } from '../scripts/utils';
import { ChunkData, ExtractedJson } from '../types';
import React, { useState } from 'react';

export default function Home() {

  const [resultJSON, setResultJSON] = useState<ExtractedJson>();
  const [errors, setErrors] = useState<string[]>([]);
  const [chunkData, setChunkData] = useState<ChunkData>();

  function handleSetFile(event: React.ChangeEvent<HTMLInputElement>) {
    // validate that this is a .txt file
    if (event.target && event.target.files?.[0].name.endsWith(".txt")) {

      let reader = new FileReader();
      reader.readAsText(event.target.files[0]);

      // read the file
      reader.onload = function(event) {

        if (event && event.target) {
          // parse just the title
          let result = String(event.target.result);
          const title = result.split("\n")[0];

          // figure out total batches
          // chunk by the demarcator, the title
          let queryString = String(event.target.result).split(title);

          // remove any empty strings from splitting the input, and indicate which ones are too big to process.
          queryString = queryString.filter((listItem, index) => {

            // current character limit for chatGPT is 4096
            if (listItem.length > 4096) {
              // index + 1 to help when someone is debugging a document and checking the chunks themselves.
              errors.push("Batch too large, number " + (index + 1));
              return false;
            }

            // remove empty strings from splitting
            if (listItem.length === 0) {
              return false;
            }

            return listItem;
          });

          console.log("queryString", queryString);

          setChunkData({
            totalChunks: queryString.length,
            chunkProgress: 0,
            activeProcessing: false,
            rateLimitTime: (queryString.length / 3)
          })

          // break into chunks to separate document to send to ai
          batchAICalls(queryString).then((result) => {
            console.log("Result in callback", result);
            let errors = result[1];
            
            // if there's resulting JSON, build out a final JSON
            if (result[0].length > 0) {
              buildResultJson(title, result[0]).then((result) => {
                setResultJSON(result);
              }).catch((err) => {
                errors.push("Error creating final JSON: " + err);
              })
            }
          });
        }

      }
  
    } else {
      errors.push("Filetype is not a txt file");
    }
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
        <form method="post" encType="multipart/form-data">
          <div>
            <label htmlFor="file">Choose txt file to upload</label>
            <input type="file" id="file" name="file" accept=".txt" onChange={(event) => handleSetFile(event)} />
          </div>
        </form>

        <div className={styles.informational}>
          { chunkData ? 
            <div>This file will be split into {chunkData.totalChunks} and processed. Due to rate limiting, this could take {Math.floor(chunkData.rateLimitTime)} minutes Proceed?</div>
          : <></>}
        </div>

        <div className={styles.processing}>
          { chunkData && chunkData.activeProcessing ? (
              <div>Processing...this could take a while due to rate limiting from chatGPT (3 calls a minute). 😢</div>
            ) : 
            <>
              <div className={styles.leftColumn}>
                Chunked Results: <br />
                <div><pre className={styles.result}>{JSON.stringify(resultJSON)}</pre></div>
              </div>

              <div className={styles.rightColumn}>
                Errors: <br />
                  {errors.length === 0 ? <span>No errors to report so far.</span> : errors}
                  <br /> 
              </div>
            </>
          }

        </div>
      </main>

      <footer>
      </footer>

    </div>
  );
}

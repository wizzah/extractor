"use client";

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { batchAICalls, buildResultJson } from '../scripts/utils';
import { ChunkData, ExtractedJson } from '../types';
import { AI_CHAR_LIMIT, INTERVAL, THROTTLE } from "../constants";
import React, { useState } from 'react';

export default function Home() {

  const [resultJSON, setResultJSON] = useState<ExtractedJson>();
  const [errors, setErrors] = useState<string[]>([]);
  const [chunkData, setChunkData] = useState<ChunkData>();

  function handleBatches() {
    setChunkData(prevState => {
      if (prevState) {
        return {...prevState, activeProcessing: true}
      }
    });

    // send chunks to ai
    batchAICalls(chunkData!.title, chunkData!.queryString, setChunkData, setErrors).then((result) => {
      console.log("Result in callback", result);
      
      // if there's resulting JSON, build out a final JSON
      if (result.length > 0) {
        buildResultJson(chunkData!.title, result).then((result) => {
          setResultJSON(result);
        }).catch((err) => {
          console.log("ERR2", err);
          // setErrors(prevState => {
          //   return prevState ? [...prevState, err] : [err];
          // });
        })
      } else {
        setErrors(prevState => {
          const errorMsg = "Error occurred creating final JSON.";
          return prevState ? [...prevState, errorMsg] : [errorMsg];
        });
      }
    });
  }

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

          setChunkData(prevState => {
            if (prevState) { 
              return {...prevState, title }
            }
          });

          // figure out total batches
          // chunk by the demarcator, the title
          let fileString = String(event.target.result).split(title);

          // remove any empty strings from splitting the input, and indicate which ones are too big to process.
          fileString = fileString.filter((listItem, index) => {

            if (listItem.length > AI_CHAR_LIMIT) {
              // index + 1 to help when someone is debugging a document and checking the chunks themselves.
              setErrors(prevState => {
                const errorMsg = `Batch number ${index + 1} was too large to query with. `;
                return prevState ? [...prevState, errorMsg] : [errorMsg];
              });
              // errors.push("Batch too large, number " + (index + 1));
              return false;
            }

            // remove empty strings from splitting
            if (listItem.length === 0) {
              return false;
            }

            return listItem;
          });

          let intervalInMin = INTERVAL / 1000;

          setChunkData({
            totalChunks: fileString.length,
            activeProcessing: false,
            rateLimitTime: Math.floor(((fileString.length / THROTTLE) * intervalInMin) / 100),
            title: title,
            queryString: fileString,
            batchNumber: 0
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
            <br />
          </div>
        </form>

        <div className={styles.informational}>
          { chunkData && 
            <>
              <div>This file will be split into {chunkData.totalChunks} chunks and processed. Due to rate limiting, 
                this could take {chunkData.rateLimitTime} minutes.
                { !chunkData.activeProcessing && <button onClick={handleBatches}>Continue</button>}
                </div>
                <div>{chunkData.activeProcessing}</div>
              <br />
              { chunkData.activeProcessing == true && <p>Completed {chunkData.batchNumber}/{chunkData.totalChunks} batches.</p> }
            </>
          }
        </div>

        <div className={styles.processing}>
          { chunkData && chunkData.activeProcessing && 
            (
              <>
              <div className={styles.leftColumn}>
                Results: <br />
                <div><pre className={styles.result}>{JSON.stringify(resultJSON)}</pre></div>
              </div>

              <div className={styles.rightColumn}>
                Errors: <br />
                  {errors.length === 0 ? <span>No errors to report so far.</span> : errors}
                  <br /> 
              </div>
            </>
            )

          }

        </div>
      </main>

      <footer>
      </footer>

    </div>
  );
}

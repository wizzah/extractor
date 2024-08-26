"use client";

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { batchAICalls, buildResultJson } from '../scripts/utils';
import { ChunkData, ExtractedJson } from '../types';
import { AI_CHAR_LIMIT, THROTTLE } from "../constants";
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
    batchAICalls(chunkData!.queryString, setChunkData, setErrors).then((result) => {
      // if there's resulting JSON, build out a final JSON
      if (result.length > 0) {
        buildResultJson(chunkData!.title, result, setErrors).then((result) => {
          setResultJSON(result);
        }).catch((err) => {
          const error = "Error building final result JSON.";
          setErrors(prevState => {
            return prevState ? [...prevState, error] : [error];
          });
        })
      } else {
        setErrors(prevState => {
          const errorMsg = "Error occurred with the batched AI calls.";
          return prevState ? [...prevState, errorMsg] : [errorMsg];
        });
      }
    });
  }

  function handleSetFile(event: React.ChangeEvent<HTMLInputElement>) {
    // validate that this is a .txt file
    const targetFile = event.target.files?.[0];
    if (event.target && targetFile && targetFile.name.endsWith(".txt")) {

      let reader = new FileReader();
      reader.readAsText(targetFile);

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
              return false;
            }

            // remove empty strings from splitting
            if (listItem.length === 0) {
              return false;
            }

            return listItem;
          });

          setChunkData({
            totalChunks: fileString.length,
            activeProcessing: false,
            rateLimitTime: Math.floor(fileString.length / THROTTLE),
            title: title,
            queryString: fileString,
            batchNumber: 0
          });
        }

      }
  
    } else {
      errors.push("Filetype is not a txt file.");
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Extract file</title>
      </Head>
      <div id={styles.informational}>
          <h1 className={styles.title}>
            Extract file contents
          </h1>

          <div>
            <form id={styles.form} method="post" encType="multipart/form-data">
              <div>
                <label htmlFor="file" className={styles.fileUploadLabel}>Choose txt file to upload:
                  <input id={styles.file} type="file" name="file" accept=".txt" onChange={(event) => handleSetFile(event)} />
                </label>
                <br />
              </div>
            </form>
          </div>

            <div>
            { chunkData && 
              <>
                <div>This file will be split into <strong>{chunkData.totalChunks}</strong> chunks and processed. Due to rate limiting, 
                  this could take about <strong>{chunkData.rateLimitTime} minutes.</strong>
                  { !chunkData.activeProcessing && <button id={styles.continueButton} onClick={handleBatches}>Continue</button>}
                  </div>
                  <div>{chunkData.activeProcessing}</div>
                <br />
                { chunkData.activeProcessing == true && <div>Completed <strong>{chunkData.batchNumber}/{chunkData.totalChunks}</strong> batches.</div> }
              </>
            }
          </div>
        </div>

        <div id={styles.processing}>
          { chunkData && chunkData.activeProcessing && 
            (
              <>
              <div className={styles.leftColumn}>
                Results: <br />
                {resultJSON == undefined && ("Pending...")}
                <div><pre className={styles.result}>{JSON.stringify(resultJSON, null, 3)}</pre></div>
              </div>

              <div className={styles.rightColumn}>
                Errors: <br />
                  {
                    errors.length === 0 ? <span>No errors to report so far.</span> : 
                    <ul>
                      {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  }
                  <br /> 
              </div>
            </>
            )
          }

        </div>
    </div>
  );
}

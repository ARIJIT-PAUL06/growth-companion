import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'


const Message = ({ message }) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])

  return (
    <div>
      {message.role === 'user' ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-[#db2a53]/30 border border-pink-500 rounded-md max-w-2xl'>
            <p className='text-sm dark:text-primary'>
              {message.content}
            </p>

            <span className='text-xs text-gray-400 dark:text-pink-200/70'>
              {moment(message.timestamp).fromNow()}
            </span>
          </div>

          <img
            src={assets.user_icon}
            alt=""
            className='w-8 rounded-full'
          />
        </div>
      ) : (
        <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-pink-700/20 border border-pink-400 rounded-md my-4'>
          
          {/* Memory Badge */}
          <div className='text-[11px] text-purple-300 bg-purple-500/30 border border-purple-200/40 rounded-lg px-2 py-1 w-fit'>
            🧠 Memory-aware response
          </div>

          <div className='text-sm dark:text-primary reset-tw'>
            <Markdown>{message.content}</Markdown>
          </div>

          <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  )
}

export default Message
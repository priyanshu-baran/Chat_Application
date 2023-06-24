import Skeleton from 'react-loading-skeleton';

export const SkeletonUI = () => {
  return (
    <div className='flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0'>
      <div className='flex flex-row items-center justify-center h-12 w-full'>
        <div className='flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10'>
          <Skeleton
            circle={true}
            height={40}
            width={40}
          />
        </div>
        <div className='ml-2 font-bold text-2xl'>
          <Skeleton
            borderRadius={8}
            height={35}
            width={120}
          />
        </div>
      </div>
      <div
        style={{ marginLeft: '-8px' }}
        className='flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg icon_parent'>
        <Skeleton
          circle={true}
          height={80}
          width={80}
        />
        <div className='text-lg font-semibold mt-2'>
          <Skeleton
            height={25}
            width={150}
          />
        </div>
        <div className='text-lg text-gray-500'>
          <Skeleton
            height={25}
            width={150}
          />
        </div>
        <div className='flex flex-row items-center mt-3'>
          <Skeleton
            height={25}
            width={150}
          />
        </div>
      </div>
      <div className='flex flex-col mt-8'>
        <div className='flex flex-row items-center justify-between text-xs'>
          <span className='font-bold'>
            <Skeleton
              borderRadius={10}
              height={20}
              width={100}
            />
          </span>
          <span className='flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full'>
            <Skeleton
              circle={true}
              height={10}
              width={10}
            />
          </span>
        </div>
        <div
          style={{ borderBottom: '1px dashed black', height: '180px' }}
          className='flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto'>
          <Skeleton
            height={130}
            width={210}
          />
        </div>
        <div className='flex flex-row items-center justify-between text-xs mt-6'>
          <span className='font-bold'>
            <Skeleton
              borderRadius={10}
              height={20}
              width={100}
            />
          </span>
          <span className='flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full'>
            <Skeleton
              circle={true}
              height={10}
              width={10}
            />
          </span>
        </div>
        <div className='flex flex-col space-y-1 mt-4 -mx-2'>
          <Skeleton
            height={60}
            width={210}
          />
        </div>
        <div style={{ padding: '10px' }}></div>
        <Skeleton
          borderRadius={15}
          width={200}
          height={35}
        />
      </div>
    </div>
  );
};

export const SkeletonMsg = () => {
  return (
    <div class='flex flex-col flex-auto h-full p-6'>
      <div class='flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4'>
        <div class='flex flex-col h-full overflow-x-auto mb-4'>
          <div class='flex flex-col h-full'>
            <div class='grid grid-cols-12 gap-y-2'>
              <div class='col-start-1 col-end-8 p-3 rounded-lg'>
                <div class='flex flex-row items-center'>
                  <Skeleton
                    circle={true}
                    height={40}
                    width={40}
                  />
                  <div style={{ padding: '5px' }}></div>
                  <Skeleton
                    borderRadius={10}
                    height={35}
                    width={140}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '-25px' }}></div>
              <div class='col-start-6 col-end-13 p-3 rounded-lg'>
                <div class='flex items-center justify-start flex-row-reverse'>
                  <Skeleton
                    circle={true}
                    height={40}
                    width={40}
                  />
                  <div style={{ padding: '5px' }}></div>
                  <Skeleton
                    borderRadius={10}
                    height={35}
                    width={140}
                  />
                </div>
                <div style={{ marginLeft: '50px', marginBottom: '-10px' }}>
                  <Skeleton
                    borderRadius={10}
                    height={20}
                    width={90}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class='flex flex-row items-center h-16 rounded-xl bg-white w-full px-4'>
          <div>
            <button class='flex items-center justify-center text-gray-400 hover:text-gray-600'>
              <svg
                class='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'></path>
              </svg>
            </button>
          </div>
          <div class='flex-grow ml-4'>
            <div class='relative w-full'>
              <input
                type='text'
                class='flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10'
              />
              <button class='absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600'>
                <svg
                  class='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                </svg>
              </button>
            </div>
          </div>
          <div class='ml-4'>
            <button class='flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0'>
              <span>Send</span>
              <span class='ml-2'>
                <svg
                  class='w-4 h-4 transform rotate-45 -mt-px'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'></path>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

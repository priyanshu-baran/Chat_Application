import Skeleton from 'react-loading-skeleton';

export const SkeletonUI = () => {
  return (
    <div className='flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0'>
      <div className='flex flex-row items-center justify-center h-12 w-full'>
        <div className='flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10'>
          <Skeleton
            circle
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
          circle
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
              circle
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
              circle
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
        <div style={{ padding: '10px' }} />
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
    <div className='flex flex-col flex-auto h-full p-6'>
      <div className='flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4'>
        <div className='flex flex-col h-full overflow-x-auto mb-4'>
          <div className='flex flex-col h-full'>
            <div className='grid grid-cols-12 gap-y-2'>
              <div className='col-start-1 col-end-8 p-3 rounded-lg'>
                <div className='flex flex-row items-center'>
                  <Skeleton
                    circle
                    height={40}
                    width={40}
                  />
                  <div style={{ padding: '5px' }} />
                  <Skeleton
                    borderRadius={10}
                    height={35}
                    width={140}
                  />
                </div>
              </div>
              <div className='col-start-6 col-end-13 p-3 rounded-lg'>
                <div className='flex items-center justify-start flex-row-reverse'>
                  <Skeleton
                    circle
                    height={40}
                    width={40}
                  />
                  <div style={{ padding: '5px' }} />
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
        <div className='flex flex-row items-center h-16 rounded-xl bg-white w-full px-4'>
          <div className='flex-grow ml-4'>
            <Skeleton
              borderRadius={12}
              height={40}
            />
          </div>
          <div className='ml-4'>
            <Skeleton
              borderRadius={12}
              width={70}
              height={36}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


<header className="App-header">


    {/* Hiển thị tên tiêu đề video */}
    <p className='content'>
        Title of video is:
        <span className={`a-content ${contentNotFound}`}>
            {titleVideo}
        </span>
    </p>

    {/* Hiển thị kênh channel */}
    <p className='content'>
        Channel of video is:
        <span className={`a-content ${contentNotFound}`}>
            {channelVideo}
        </span>
    </p>

    {/* Hiển thị link hình ảnh */}
    <p className='content'>
        <span className='span-content'>
            Link of image video is:
        </span>
        <a className={`a-content ${contentNotFound}`}
            href={imageUrl}
        >
            {imageUrl}
        </a>
    </p>

    {/* Hiển thị link video */}
    <p className='content'>
        <span className='span-content'>
            Link of video is:
        </span>
        <a className={`a-content`}
            href={`https://www.youtube.com/${urlVideo}`}
        >
            {`https://www.youtube.com/${urlVideo}`}
        </a>
    </p>

    {/* Hiển thị link channel */}
    <p className='content'>
        <span className='span-content'>
            Link Channel of video is:
        </span>
        {
            channelVideo !== "Not Found"
                ? (
                    <a className={`a-content ${contentNotFound}`}
                        href={`https://www.youtube.com/${urlChannel}`}
                    >
                        {`https://www.youtube.com/${urlChannel}`}
                    </a>
                )
                : (
                    <span className={`${contentNotFound}`}>
                        {channelVideo}
                    </span>
                )
        }
    </p>

</header>
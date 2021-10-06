export default [
    {
        x: 10, // between 0 and 19
        y: 4, // between 0 and 19
        outlier: 27, // [0, 49] = [deep blue, light blue], [50, 100] = [light red, deep red]
        // Drives the preview panel on the right
        samples: [
            {
                image_url: 'https://fakeimg.pl/',
                width: 200,
                height: 300,
                // a red rectangle (box) has to be drawn on top of the given image.
                // x is the horizontal coordinate (from left to right) of the top left corner of the box.
                // y is the vertical coordinate (from top to bottom) of the top left corner of the box.

                // WARNING: x, y, height and width are in number of pixels of the parent image.
                // This means the height and width of the red box on screen will depend on the
                // size of the <img/> element. Similarly for x and y.
                bounding_box: {
                    height: 20,
                    width: 30,
                    x: 20,
                    y: 100 // ints
                }
            },
            {
                image_url: 'https://fakeimg.pl/',
                width: 200,
                height: 300,
                // a red rectangle (box) has to be drawn on top of the given image.
                // x is the horizontal coordinate (from left to right) of the top left corner of the box.
                // y is the vertical coordinate (from top to bottom) of the top left corner of the box.

                // WARNING: x, y, height and width are in number of pixels of the parent image.
                // This means the height and width of the red box on screen will depend on the
                // size of the <img/> element. Similarly for x and y.
                bounding_box: {
                    height: 20,
                    width: 30,
                    x: 2,
                    y: 10 // ints
                }
            },
            {
                image_url: 'https://fakeimg.pl/',
                width: 200,
                height: 300,
                // a red rectangle (box) has to be drawn on top of the given image.
                // x is the horizontal coordinate (from left to right) of the top left corner of the box.
                // y is the vertical coordinate (from top to bottom) of the top left corner of the box.

                // WARNING: x, y, height and width are in number of pixels of the parent image.
                // This means the height and width of the red box on screen will depend on the
                // size of the <img/> element. Similarly for x and y.
                bounding_box: {
                    height: 80,
                    width: 100,
                    x: 120,
                    y: 10 // ints
                }
            },
            {
                image_url: 'https://fakeimg.pl/',
                width: 200,
                height: 300,
                // a red rectangle (box) has to be drawn on top of the given image.
                // x is the horizontal coordinate (from left to right) of the top left corner of the box.
                // y is the vertical coordinate (from top to bottom) of the top left corner of the box.

                // WARNING: x, y, height and width are in number of pixels of the parent image.
                // This means the height and width of the red box on screen will depend on the
                // size of the <img/> element. Similarly for x and y.
                bounding_box: {
                    height: 20,
                    width: 30,
                    x: 2,
                    y: 10 // ints
                }
            }
        ]
    },
    {
        x: 2, // between 0 and 19
        y: 5, // between 0 and 19
        outlier: 72, // [0, 49] = [deep blue, light blue], [50, 100] = [light red, deep red]
        // Drives the preview panel on the right
        samples: []
    }
];

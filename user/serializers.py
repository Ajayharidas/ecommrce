import json


class CartSerializer:
    def __init__(self, products):
        self.products = products

    def serialize(self):
        serialized_data = [
            {
                "id": item.id,
                "product": {
                    "id": item.productsize.product.id,
                    "name": item.productsize.product.name,
                    "desciption": item.productsize.product.description,
                    "slug": item.productsize.product.slug,
                    "price": item.productsize.product.price,
                    "brand": {
                        "id": item.productsize.product.brand.id,
                        "name": item.productsize.product.brand.name,
                    },
                    "images": [
                        {"id": int(image.id), "path": str(image.image)}
                        for image in item.productsize.product.productimage.all()
                    ],
                    "sizes": [
                        {
                            "id": size.size.id,
                            "name": size.size.name,
                            "stock": size.stock,
                        }
                        for size in item.productsize.product.productsize.all()
                    ],
                },
                "selectedsize": item.productsize.size.id,
                "quantity": item.quantity,
            }
            for item in self.products
        ]
        return json.dumps(serialized_data)


class WishlistSerializer:
    def __init__(self, wishlist):
        self.wishlist = wishlist

    def serialize(self):
        serialized_data = (
            [
                {
                    "id": item.id,
                    "product": {
                        "id": item.product.id,
                        "name": item.product.name,
                        "desciption": item.product.description,
                        "slug": item.product.slug,
                        "price": item.product.price,
                        "brand": {
                            "id": item.product.brand.id,
                            "name": item.product.brand.name,
                        },
                        "images": [
                            {"id": int(image.id), "path": str(image.image)}
                            for image in item.product.productimage.all()
                        ],
                    },
                    "added_at": str(item.added_at),
                }
                for item in self.wishlist.items.all()
            ]
            if self.wishlist
            else None
        )
        return json.dumps(serialized_data)

import json


class CartSerializer:
    def __init__(self, products):
        self.products = products

    def serialize(self):
        serialized_data = [
            {
                "id": item.id,
                "product": {
                    "id": item.product.product.id,
                    "name": item.product.product.name,
                    "desciption": item.product.product.description,
                    "slug": item.product.product.slug,
                    "price": item.product.product.price,
                    "brand": {
                        "id": item.product.product.brand.id,
                        "name": item.product.product.brand.name,
                    },
                    "images": [
                        {"id": int(image.id), "path": str(image.image)}
                        for image in item.product.product.productimage.all()
                    ],
                    "sizes": [
                        {
                            "id": size.size.id,
                            "name": size.size.name,
                            "stock": size.stock,
                        }
                        for size in item.product.product.productsize.all()
                    ],
                },
                "selectedsize": item.product.size.id,
                "quantity": item.quantity,
            }
            for item in self.products
        ]
        return json.dumps(serialized_data)

from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser
from rest_framework import status
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from books.models import Book
from books.serializers import BookSerializer
from rest_framework.decorators import api_view

# Create your views here.
# def index(request):
#     return render(request, "books/index.html")

def index(request):
    queryset = Book.objects.all()
    return render(request, "books/index.html", {'books': queryset})


class index(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'books/index.html'

    def get(self, request):
        queryset = Book.objects.all()
        return Response({'books': queryset})


class list_all_books(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'books/book_list.html'

    def get(self, request):
        queryset = Book.objects.all()
        return Response({'books': queryset})


# Create your views here.
@api_view(['GET', 'POST', 'DELETE'])
def book_list(request):
    if request.method == 'GET':
        books = Book.objects.all()

        title = request.GET.get('title', None)
        if title is not None:
            books = books.filter(title__icontains=title)

        books_serializer = BookSerializer(books, many=True)
        return JsonResponse(books_serializer.data, safe=False)
        # 'safe=False' for objects serialization

    elif request.method == 'POST':
        book_data = JSONParser().parse(request)
        book_serializer = BookSerializer(data=book_data)
        if book_serializer.is_valid():
            book_serializer.save()
            return JsonResponse(book_serializer.data,
                                status=status.HTTP_201_CREATED)
        return JsonResponse(book_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        count = Book.objects.all().delete()
        return JsonResponse(
            {
                'message':
                '{} Books were deleted successfully!'.format(count[0])
            },
            status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'PUT', 'DELETE'])
def book_detail(request, pk):
    try:
        book = Book.objects.get(pk=pk)
    except Book.DoesNotExist:
        return JsonResponse({'message': 'The book does not exist'},
                            status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        book_serializer = BookSerializer(book)
        return JsonResponse(book_serializer.data)

    elif request.method == 'PUT':
        book_data = JSONParser().parse(request)
        book_serializer = BookSerializer(book, data=book_data)
        if book_serializer.is_valid():
            book_serializer.save()
            return JsonResponse(book_serializer.data)
        return JsonResponse(book_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        book.delete()
        return JsonResponse({'message': 'Book was deleted successfully!'},
                            status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def book_list_available(request):
    books = Book.objects.filter(available=True)

    if request.method == 'GET':
        books_serializer = BookSerializer(books, many=True)
        return JsonResponse(books_serializer.data, safe=False)
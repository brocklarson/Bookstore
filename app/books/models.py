from django.db import models

# Create your models here.
class Book(models.Model):
    title = models.CharField(max_length=100, blank=False, default='')
    price = models.FloatField(blank=False, default=0.0)
    paperback = models.BooleanField(blank=False, default=True)
    available = models.BooleanField(blank=False, default=True)

class Author(models.Model):
    name = models.CharField(max_length=100, blank=False, default='')
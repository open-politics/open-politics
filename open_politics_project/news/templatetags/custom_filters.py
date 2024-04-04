from django import template

register = template.Library()

@register.filter(name='getattr')
def get_attribute(value, arg):
    default = ""
    return getattr(value, arg, default)

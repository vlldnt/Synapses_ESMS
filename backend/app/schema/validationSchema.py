import re
from marshmallow import ValidationError

EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9._%+\-À-ÖØ-öø-ž]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$"
)
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
)
NAME_REGEX = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿ '-]{2,50}$")
ORG_REGEX = re.compile(r"^[A-Za-z0-9À-ÖØ-öø-ÿ '&-]{2,80}$")
DANGEROUS_PATTERN = re.compile(r"[<>;$`|]")
JOB_REGEX = re.compile(r"^[A-Za-z0-9À-ÖØ-öø-ÿ\s\-'/&.,]{2,128}$")
UUID_REGEX = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
ROLE_VALUES = {"user", "agent", "admin"}

def validate_email(value):
    if not value:
        raise ValidationError("Votre email ne doit pas être vide.")

    value = value.strip().lower()

    if len(value) > 120:
        raise ValidationError("Votre email ne doit pas depasser 120 caractères.")

    if not EMAIL_REGEX.match(value):
        raise ValidationError("Le format de votre email n'est pas bon.")

    return value

def validate_password(value):
    if not value:
        raise ValidationError("Le mot de passe ne doit pas être vide.")

    if not PASSWORD_REGEX.match(value):
        raise ValidationError(
            "Le mot de passe doit contenir au minimum 8 de longeur avec un minuscule, un majuscule, un chiffre, un caractère spécial."
        )

    return value

def validate_first_name(value):
    if not value:
        raise ValidationError("Field is required")

    value = value.strip()

    if not NAME_REGEX.match(value):
        raise ValidationError("Le format du prenom n'est pas bon.")

    return value

def validate_last_name(value):
    if not value:
        raise ValidationError("Field is required")

    value = value.strip()

    if not NAME_REGEX.match(value):
        raise ValidationError("Le format du nom n'est pas bon.")
    
    return value

def validate_org_name(value):
    if not value:
        raise ValidationError("Votre nom d'organisation ne doit pas être vide.")

    value = value.strip()

    if not ORG_REGEX.match(value):
        raise ValidationError("Le format de votre nom d'organisation n'est pas bon.")

    return value


def validate_structure_type(value):
    if not value:
        raise ValidationError("Le type de structure ne doit pas être vide.")

    value = value.strip()

    if len(value) < 2 or len(value) > 80:
        raise ValidationError("Le type de structure doit contenir entre 2 et 80 caractères.")

    if not ORG_REGEX.match(value):
        raise ValidationError("Le format du type de structure n'est pas bon.")

    return value


def validate_description(value):
    if value is None:
        return value

    value = value.strip()
    if value == "":
        return value

    if len(value) > 500:
        raise ValidationError("La description ne doit pas dépasser 500 caractères.")

    if DANGEROUS_PATTERN.search(value):
        raise ValidationError("La description contient des caractères non autorisés.")

    return value


def validate_job(value):
    if not value:
        raise ValidationError("Le métier ne doit pas être vide.")

    value = value.strip()

    if len(value) < 2 or len(value) > 128:
        raise ValidationError("Le métier doit contenir entre 2 et 128 caractères.")

    if DANGEROUS_PATTERN.search(value):
        raise ValidationError("Le format du métier n'est pas bon.")

    return value


def validate_role(value):
    if value is None:
        return value

    value = value.strip().lower()
    if value not in ROLE_VALUES:
        raise ValidationError("Le rôle n'est pas valide.")

    return value


def validate_uuid(value):
    if not value:
        raise ValidationError("L'identifiant est requis.")

    value = value.strip()
    if not UUID_REGEX.match(value):
        raise ValidationError("Le format de l'identifiant est invalide.")

    return value


def validate_safe_string(value):
    if value is None:
        return value

    if DANGEROUS_PATTERN.search(value):
        raise ValidationError("des charactères non autoriser est detecter")

    return value.strip()